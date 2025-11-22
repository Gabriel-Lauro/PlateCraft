const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, runQuery, getQuery } = require('../database/dbSetup');
const { jsonResponse } = require('../utils/responses');
const { tokenRequired, getSecretKey } = require('../middleware/authMiddleware');
require('dotenv').config();

const router = express.Router();

/**
 * Retorna o número de dias de expiração do token
 */
function getTokenExpirationDays() {
  return parseInt(process.env.TOKEN_EXPIRATION_DAYS || 30);
}

/**
 * POST /auth/registro
 * Registra um novo usuário
 */
router.post('/registro', async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return jsonResponse(res, { erro: 'Dados não fornecidos' }, 400);
    }

    const nome = (data.nome || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const senha = data.senha || '';

    // Validações
    if (!nome || nome.length < 2) {
      return jsonResponse(res, { erro: 'Nome deve ter pelo menos 2 caracteres' }, 400);
    }

    if (!email || !email.includes('@')) {
      return jsonResponse(res, { erro: 'Email inválido' }, 400);
    }

    if (!senha || senha.length < 6) {
      return jsonResponse(res, { erro: 'Senha deve ter pelo menos 6 caracteres' }, 400);
    }

    const db = await getDb();

    // Verifica se o email já existe
    const existingUser = await getQuery(db, 'SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser) {
      db.close();
      return jsonResponse(res, { erro: 'Email já cadastrado' }, 400);
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere o usuário
    const result = await runQuery(
      db,
      'INSERT INTO users (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    const userId = result.id;

    // Gera token JWT
    const token = jwt.sign(
      {
        user_id: userId,
        exp: Math.floor(Date.now() / 1000) + (getTokenExpirationDays() * 24 * 60 * 60)
      },
      getSecretKey(),
      { algorithm: 'HS256' }
    );

    db.close();

    return jsonResponse(
      res,
      {
        sucesso: true,
        mensagem: 'Usuário registrado com sucesso',
        token: token,
        usuario: {
          id: userId,
          nome: nome,
          email: email
        }
      },
      201
    );
  } catch (error) {
    console.error('Erro no registro:', error);
    return jsonResponse(res, { erro: 'Erro ao registrar usuário' }, 500);
  }
});

/**
 * POST /auth/login
 * Autentica um usuário
 */
router.post('/login', async (req, res) => {
  try {
    const data = req.body;

    if (!data) {
      return jsonResponse(res, { erro: 'Dados não fornecidos' }, 400);
    }

    const email = (data.email || '').trim().toLowerCase();
    const senha = data.senha || '';

    if (!email || !senha) {
      return jsonResponse(res, { erro: 'Email e senha são obrigatórios' }, 400);
    }

    const db = await getDb();

    const user = await getQuery(
      db,
      'SELECT id, nome, email, senha_hash FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      db.close();
      return jsonResponse(res, { erro: 'Email ou senha incorretos' }, 401);
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);

    if (!senhaValida) {
      db.close();
      return jsonResponse(res, { erro: 'Email ou senha incorretos' }, 401);
    }

    // Gera token JWT
    const token = jwt.sign(
      {
        user_id: user.id,
        exp: Math.floor(Date.now() / 1000) + (getTokenExpirationDays() * 24 * 60 * 60)
      },
      getSecretKey(),
      { algorithm: 'HS256' }
    );

    db.close();

    return jsonResponse(res, {
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      token: token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return jsonResponse(res, { erro: 'Erro ao fazer login' }, 500);
  }
});

/**
 * GET /auth/perfil
 * Retorna os dados do usuário autenticado
 */
router.get('/perfil', tokenRequired, async (req, res) => {
  try {
    const userId = req.userId;
    const db = await getDb();

    const user = await getQuery(
      db,
      'SELECT id, nome, email, data_criacao FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      db.close();
      return jsonResponse(res, { erro: 'Usuário não encontrado' }, 404);
    }

    // Conta favoritos
    const favoritosResult = await getQuery(
      db,
      'SELECT COUNT(*) as total FROM favoritos WHERE user_id = ?',
      [userId]
    );

    const favoritosCount = favoritosResult.total || 0;

    // Conta receitas enviadas
    const receitasResult = await getQuery(
      db,
      'SELECT COUNT(*) as total FROM receitas_usuario WHERE user_id = ?',
      [userId]
    );

    const receitasCount = receitasResult.total || 0;

    db.close();

    return jsonResponse(res, {
      sucesso: true,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        data_criacao: user.data_criacao,
        total_favoritos: favoritosCount,
        total_receitas: receitasCount
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return jsonResponse(res, { erro: 'Erro ao buscar perfil' }, 500);
  }
});

module.exports = router;
