from flask import Blueprint, request, current_app
import bcrypt
import jwt
import datetime
import os
from functools import wraps
from dotenv import load_dotenv
from database.db_setup import get_db
from utils.responses import json_response

load_dotenv()

auth_bp = Blueprint('auth', __name__)

def get_secret_key():
    """Retorna a chave secreta para JWT"""
    return os.getenv('JWT_SECRET_KEY') or os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

def get_token_expiration_days():
    """Retorna o número de dias de expiração do token"""
    return int(os.getenv('TOKEN_EXPIRATION_DAYS', 30))

def token_required(f):
    """Decorator para proteger rotas que requerem autenticação"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return json_response({'erro': 'Token não fornecido'}, 401)
        
        # Remove o prefixo "Bearer " se existir
        if token.startswith('Bearer '):
            token = token[7:]
        
        try:
            data = jwt.decode(token, get_secret_key(), algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return json_response({'erro': 'Token expirado'}, 401)
        except jwt.InvalidTokenError:
            return json_response({'erro': 'Token inválido'}, 401)
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

@auth_bp.route('/registro', methods=['POST'])
def registro():
    """Registra um novo usuário"""
    data = request.get_json()
    
    if not data:
        return json_response({'erro': 'Dados não fornecidos'}, 400)
    
    nome = data.get('nome', '').strip()
    email = data.get('email', '').strip().lower()
    senha = data.get('senha', '')
    
    # Validações
    if not nome or len(nome) < 2:
        return json_response({'erro': 'Nome deve ter pelo menos 2 caracteres'}, 400)
    
    if not email or '@' not in email:
        return json_response({'erro': 'Email inválido'}, 400)
    
    if not senha or len(senha) < 6:
        return json_response({'erro': 'Senha deve ter pelo menos 6 caracteres'}, 400)
    
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        cursor = conn.cursor()
        
        # Verifica se o email já existe
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return json_response({'erro': 'Email já cadastrado'}, 400)
        
        # Hash da senha
        senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insere o usuário
        cursor.execute("""
            INSERT INTO users (nome, email, senha_hash)
            VALUES (?, ?, ?)
        """, (nome, email, senha_hash))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Gera token JWT
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=get_token_expiration_days())
        }, get_secret_key(), algorithm='HS256')
        
        return json_response({
            'sucesso': True,
            'mensagem': 'Usuário registrado com sucesso',
            'token': token,
            'usuario': {
                'id': user_id,
                'nome': nome,
                'email': email
            }
        }, 201)
        
    except Exception as e:
        conn.close()
        print(f"Erro no registro: {e}")
        return json_response({'erro': 'Erro ao registrar usuário'}, 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Autentica um usuário"""
    data = request.get_json()
    
    if not data:
        return json_response({'erro': 'Dados não fornecidos'}, 400)
    
    email = data.get('email', '').strip().lower()
    senha = data.get('senha', '')
    
    if not email or not senha:
        return json_response({'erro': 'Email e senha são obrigatórios'}, 400)
    
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, nome, email, senha_hash
            FROM users
            WHERE email = ?
        """, (email,))
        
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return json_response({'erro': 'Email ou senha incorretos'}, 401)
        
        # Verifica a senha
        if not bcrypt.checkpw(senha.encode('utf-8'), user['senha_hash'].encode('utf-8')):
            return json_response({'erro': 'Email ou senha incorretos'}, 401)
        
        # Gera token JWT
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=get_token_expiration_days())
        }, get_secret_key(), algorithm='HS256')
        
        return json_response({
            'sucesso': True,
            'mensagem': 'Login realizado com sucesso',
            'token': token,
            'usuario': {
                'id': user['id'],
                'nome': user['nome'],
                'email': user['email']
            }
        })
        
    except Exception as e:
        conn.close()
        print(f"Erro no login: {e}")
        return json_response({'erro': 'Erro ao fazer login'}, 500)

@auth_bp.route('/perfil', methods=['GET'])
@token_required
def perfil(current_user_id):
    """Retorna os dados do usuário autenticado"""
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, nome, email, data_criacao
            FROM users
            WHERE id = ?
        """, (current_user_id,))
        
        user = cursor.fetchone()
        
        # Conta favoritos
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM favoritos
            WHERE user_id = ?
        """, (current_user_id,))
        
        favoritos_count = cursor.fetchone()['total']
        
        # Conta receitas enviadas
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM receitas_usuario
            WHERE user_id = ?
        """, (current_user_id,))
        
        receitas_count = cursor.fetchone()['total']
        
        conn.close()
        
        if not user:
            return json_response({'erro': 'Usuário não encontrado'}, 404)
        
        return json_response({
            'sucesso': True,
            'usuario': {
                'id': user['id'],
                'nome': user['nome'],
                'email': user['email'],
                'data_criacao': user['data_criacao'],
                'total_favoritos': favoritos_count,
                'total_receitas': receitas_count
            }
        })
        
    except Exception as e:
        conn.close()
        print(f"Erro ao buscar perfil: {e}")
        return json_response({'erro': 'Erro ao buscar perfil'}, 500)