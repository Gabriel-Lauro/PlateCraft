from flask import Blueprint, request
from database.db_setup import get_db
from utils.responses import json_response
from utils.receitas_utils import buscar_receitas, normalizar_texto
from routes.auth_routes import token_required

receitas_bp = Blueprint('receitas', __name__)

@receitas_bp.route('/receitas', methods=['GET'])
def listar_receitas():
    """Busca receitas por ingredientes (não requer autenticação)"""
    ingredientes_param = request.args.get('ingredientes', '').strip()
    
    if not ingredientes_param:
        return json_response({'erro': 'Parâmetro "ingredientes" obrigatório'}, 400)
    
    ingredientes = [i.strip() for i in ingredientes_param.split(',') if i.strip()]
    
    if not ingredientes:
        return json_response({'erro': 'Nenhum ingrediente válido'}, 400)
    
    pagina = max(1, request.args.get('pagina', 1, type=int))
    offset = (pagina - 1) * 10
    
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    resultados = buscar_receitas(conn, ingredientes)
    conn.close()
    
    total = len(resultados)
    receitas_pagina = resultados[offset:offset+10]
    
    return json_response({
        'sucesso': True,
        'ingredientes': ingredientes,
        'pagina': pagina,
        'total': total,
        'mostrando': len(receitas_pagina),
        'tem_mais': (offset + 10) < total,
        'receitas': receitas_pagina
    })

@receitas_bp.route('/receitas/<int:recipe_id>', methods=['GET'])
def detalhes_receita(recipe_id):
    """Retorna os detalhes de uma receita"""
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        cursor = conn.cursor()
        
        # Busca os dados principais da receita
        cursor.execute("""
            SELECT id, titulo, nota, avaliacoes, autor, 
                   tempo_preparo, link, imagem, descricao, informacoes_adicionais
            FROM recipes
            WHERE id = ?
        """, (recipe_id,))
        
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return json_response({'erro': 'Receita não encontrada'}, 404)
        
        receita = dict(row)
        
        # Busca os ingredientes
        cursor.execute("""
            SELECT item
            FROM ingredients
            WHERE recipe_id = ?
            ORDER BY id
        """, (recipe_id,))
        
        receita['ingredientes'] = [row['item'] for row in cursor.fetchall()]
        
        # Busca os passos do modo de preparo
        cursor.execute("""
            SELECT text
            FROM recipe_steps
            WHERE recipe_id = ?
            ORDER BY position
        """, (recipe_id,))
        
        receita['modo_preparo'] = [row['text'] for row in cursor.fetchall()]
        
        conn.close()
        
        return json_response({
            'sucesso': True,
            'receita': receita
        })
        
    except Exception as e:
        conn.close()
        print(f"Error: {e}")
        return json_response({'erro': 'Erro ao buscar receita'}, 500)

@receitas_bp.route('/receitas/<int:recipe_id>/favoritar', methods=['POST'])
@token_required
def favoritar_receita(current_user_id, recipe_id):
    """Adiciona ou remove uma receita dos favoritos"""
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        cursor = conn.cursor()
        
        # Verifica se a receita existe
        cursor.execute("SELECT id FROM recipes WHERE id = ?", (recipe_id,))
        if not cursor.fetchone():
            conn.close()
            return json_response({'erro': 'Receita não encontrada'}, 404)
        
        # Verifica se já está favoritada
        cursor.execute("""
            SELECT id FROM favoritos
            WHERE user_id = ? AND recipe_id = ?
        """, (current_user_id, recipe_id))
        
        favorito = cursor.fetchone()
        
        if favorito:
            # Remove dos favoritos
            cursor.execute("""
                DELETE FROM favoritos
                WHERE user_id = ? AND recipe_id = ?
            """, (current_user_id, recipe_id))
            conn.commit()
            conn.close()
            return json_response({
                'sucesso': True,
                'mensagem': 'Receita removida dos favoritos',
                'favoritado': False
            })
        else:
            # Adiciona aos favoritos
            cursor.execute("""
                INSERT INTO favoritos (user_id, recipe_id)
                VALUES (?, ?)
            """, (current_user_id, recipe_id))
            conn.commit()
            conn.close()
            return json_response({
                'sucesso': True,
                'mensagem': 'Receita adicionada aos favoritos',
                'favoritado': True
            })
        
    except Exception as e:
        conn.close()
        print(f"Erro ao favoritar: {e}")
        return json_response({'erro': 'Erro ao favoritar receita'}, 500)

@receitas_bp.route('/receitas/favoritos', methods=['GET'])
@token_required
def listar_favoritos(current_user_id):
    """Lista todas as receitas favoritas do usuário com paginação"""
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        # Paginação
        pagina = max(1, request.args.get('pagina', 1, type=int))
        offset = (pagina - 1) * 10
        
        cursor = conn.cursor()
        
        # Conta total de favoritos
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM favoritos
            WHERE user_id = ?
        """, (current_user_id,))
        
        total = cursor.fetchone()['total']
        
        # Busca favoritos com paginação
        cursor.execute("""
            SELECT r.id, r.titulo, r.nota, r.avaliacoes, r.autor,
                   r.tempo_preparo, r.link, r.imagem, f.data_favoritado
            FROM favoritos f
            JOIN recipes r ON r.id = f.recipe_id
            WHERE f.user_id = ?
            ORDER BY f.data_favoritado DESC
            LIMIT 10 OFFSET ?
        """, (current_user_id, offset))
        
        favoritos = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return json_response({
            'sucesso': True,
            'pagina': pagina,
            'total': total,
            'mostrando': len(favoritos),
            'tem_mais': (offset + 10) < total,
            'receitas': favoritos
        })
        
    except Exception as e:
        conn.close()
        print(f"Erro ao buscar favoritos: {e}")
        return json_response({'erro': 'Erro ao buscar favoritos'}, 500)

@receitas_bp.route('/receitas/minhas', methods=['GET'])
@token_required
def listar_minhas_receitas(current_user_id):
    """Lista todas as receitas enviadas pelo usuário com paginação"""
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        # Paginação
        pagina = max(1, request.args.get('pagina', 1, type=int))
        offset = (pagina - 1) * 10
        
        cursor = conn.cursor()
        
        # Conta total de receitas
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM receitas_usuario
            WHERE user_id = ?
        """, (current_user_id,))
        
        total = cursor.fetchone()['total']
        
        # Busca receitas com paginação
        cursor.execute("""
            SELECT id, titulo, descricao, tempo_preparo, imagem, data_criacao
            FROM receitas_usuario
            WHERE user_id = ?
            ORDER BY data_criacao DESC
            LIMIT 10 OFFSET ?
        """, (current_user_id, offset))
        
        receitas = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return json_response({
            'sucesso': True,
            'pagina': pagina,
            'total': total,
            'mostrando': len(receitas),
            'tem_mais': (offset + 10) < total,
            'receitas': receitas
        })
        
    except Exception as e:
        conn.close()
        print(f"Erro ao buscar receitas: {e}")
        return json_response({'erro': 'Erro ao buscar receitas'}, 500)

@receitas_bp.route('/receitas', methods=['POST'])
@token_required
def criar_receita(current_user_id):
    """Cria uma nova receita do usuário"""
    data = request.get_json()
    
    if not data:
        return json_response({'erro': 'Dados não fornecidos'}, 400)
    
    titulo = data.get('titulo', '').strip()
    descricao = data.get('descricao', '').strip()
    tempo_preparo = data.get('tempo_preparo', '').strip()
    ingredientes = data.get('ingredientes', [])
    modo_preparo = data.get('modo_preparo', [])
    imagem = data.get('imagem', '').strip()
    
    # Validações
    if not titulo or len(titulo) < 3:
        return json_response({'erro': 'Título deve ter pelo menos 3 caracteres'}, 400)
    
    if not ingredientes or len(ingredientes) < 1:
        return json_response({'erro': 'Adicione pelo menos 1 ingrediente'}, 400)
    
    if not modo_preparo or len(modo_preparo) < 1:
        return json_response({'erro': 'Adicione pelo menos 1 passo no modo de preparo'}, 400)
    
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        cursor = conn.cursor()
        
        # Converte listas para JSON strings
        ingredientes_json = '\n'.join(ingredientes)
        modo_preparo_json = '\n'.join(modo_preparo)
        
        cursor.execute("""
            INSERT INTO receitas_usuario 
            (user_id, titulo, descricao, tempo_preparo, ingredientes, modo_preparo, imagem)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (current_user_id, titulo, descricao, tempo_preparo, 
              ingredientes_json, modo_preparo_json, imagem))
        
        receita_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return json_response({
            'sucesso': True,
            'mensagem': 'Receita criada com sucesso',
            'receita_id': receita_id
        }, 201)
        
    except Exception as e:
        conn.close()
        print(f"Erro ao criar receita: {e}")
        return json_response({'erro': 'Erro ao criar receita'}, 500)

@receitas_bp.route('/receitas/minhas/<int:receita_id>', methods=['GET'])
@token_required
def detalhes_minha_receita(current_user_id, receita_id):
    """Retorna os detalhes de uma receita do usuário"""
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, titulo, descricao, tempo_preparo, ingredientes, 
                   modo_preparo, imagem, data_criacao
            FROM receitas_usuario
            WHERE id = ? AND user_id = ?
        """, (receita_id, current_user_id))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return json_response({'erro': 'Receita não encontrada'}, 404)
        
        receita = dict(row)
        receita['ingredientes'] = receita['ingredientes'].split('\n') if receita['ingredientes'] else []
        receita['modo_preparo'] = receita['modo_preparo'].split('\n') if receita['modo_preparo'] else []
        
        return json_response({
            'sucesso': True,
            'receita': receita
        })
        
    except Exception as e:
        conn.close()
        print(f"Erro ao buscar receita: {e}")
        return json_response({'erro': 'Erro ao buscar receita'}, 500)

@receitas_bp.route('/receitas/surpresa', methods=['GET'])
def receita_surpresa():
    """Sorteia uma receita aleatória do banco de dados"""
    conn = get_db()
    if not conn:
        return json_response({'erro': 'Erro ao conectar no banco'}, 500)
    
    try:
        cursor = conn.cursor()
        
        # Conta total de receitas
        cursor.execute("SELECT COUNT(*) as total FROM recipes")
        total = cursor.fetchone()['total']
        
        if total == 0:
            conn.close()
            return json_response({'erro': 'Nenhuma receita disponível'}, 404)
        
        # Sorteia uma receita aleatória
        cursor.execute("""
            SELECT id, titulo, nota, avaliacoes, autor, 
                   tempo_preparo, link, imagem, descricao, informacoes_adicionais
            FROM recipes
            ORDER BY RANDOM()
            LIMIT 1
        """)
        
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return json_response({'erro': 'Erro ao sortear receita'}, 500)
        
        receita = dict(row)
        recipe_id = receita['id']
        
        # Busca os ingredientes
        cursor.execute("""
            SELECT item
            FROM ingredients
            WHERE recipe_id = ?
            ORDER BY id
        """, (recipe_id,))
        
        receita['ingredientes'] = [row['item'] for row in cursor.fetchall()]
        
        # Busca os passos do modo de preparo
        cursor.execute("""
            SELECT text
            FROM recipe_steps
            WHERE recipe_id = ?
            ORDER BY position
        """, (recipe_id,))
        
        receita['modo_preparo'] = [row['text'] for row in cursor.fetchall()]
        
        conn.close()
        
        return json_response({
            'sucesso': True,
            'mensagem': 'Receita surpresa! 🎉',
            'receita': receita
        })
        
    except Exception as e:
        conn.close()
        print(f"Erro ao sortear receita: {e}")
        return json_response({'erro': 'Erro ao sortear receita'}, 500)