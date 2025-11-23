const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb } = require('./database/dbSetup');
const authRoutes = require('./routes/authRoutes');
const receitasRoutes = require('./routes/receitasRoutes');
const { jsonResponse } = require('./utils/responses');

const app = express();

// Configurações
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
};
app.use(cors(corsOptions));

// Rotas
app.use('/auth', authRoutes);
app.use('/', receitasRoutes);

// Rota raiz
app.get('/', (req, res) => {
  return jsonResponse(res, {
    status: 'online',
    endpoints: {
      auth: {
        registro: 'POST /auth/registro',
        login: 'POST /auth/login',
        perfil: 'GET /auth/perfil (requer token)'
      },
      receitas: {
        buscar: 'GET /receitas?ingredientes=x,y&pagina=1',
        detalhes: 'GET /receitas/<id>',
        surpresa: 'GET /receitas/surpresa',
        favoritar: 'POST /receitas/<id>/favoritar (requer token)',
        favoritos: 'GET /receitas/favoritos?pagina=1 (requer token)',
        minhas: 'GET /receitas/minhas?pagina=1 (requer token)',
        criar: 'POST /receitas (requer token)'
      }
    }
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  return jsonResponse(res, { erro: 'Rota não encontrada' }, 404);
});

// Inicialização do servidor
const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || 5000);

async function startServer() {
  try {
    // Inicializa o banco de dados de usuários
    await initDb();

    app.listen(PORT, HOST, () => {
      console.log(`Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
