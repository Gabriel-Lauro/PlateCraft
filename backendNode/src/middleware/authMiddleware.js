const jwt = require('jsonwebtoken');
const { jsonResponse } = require('../utils/responses');
require('dotenv').config();

/**
 * Retorna a chave secreta para JWT
 */
function getSecretKey() {
  return process.env.JWT_SECRET_KEY || process.env.SECRET_KEY || 'dev-secret-key-change-in-production';
}

/**
 * Middleware para proteger rotas que requerem autenticação
 */
function tokenRequired(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return jsonResponse(res, { erro: 'Token não fornecido' }, 401);
  }

  // Remove o prefixo "Bearer " se existir
  let cleanToken = token;
  if (token.startsWith('Bearer ')) {
    cleanToken = token.slice(7);
  }

  try {
    const data = jwt.verify(cleanToken, getSecretKey(), { algorithms: ['HS256'] });
    req.userId = data.user_id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return jsonResponse(res, { erro: 'Token expirado' }, 401);
    }
    return jsonResponse(res, { erro: 'Token inválido' }, 401);
  }
}

module.exports = {
  tokenRequired,
  getSecretKey
};
