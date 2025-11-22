const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || 'receitas_tudogostoso.db';

/**
 * Retorna uma conexão com o banco de dados
 */
function getDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('DB Error:', err);
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

/**
 * Executa uma query no banco de dados
 */
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Busca um registro no banco de dados
 */
function getQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Busca múltiplos registros no banco de dados
 */
function allQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

/**
 * Inicializa as tabelas necessárias no banco de dados
 */
async function initDb() {
  try {
    const db = await getDb();

    // Tabela de usuários
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de receitas favoritas
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS favoritos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        recipe_id INTEGER NOT NULL,
        data_favoritado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (recipe_id) REFERENCES recipes(id),
        UNIQUE(user_id, recipe_id)
      )
    `);

    // Tabela de receitas enviadas pelos usuários
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS receitas_usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        descricao TEXT,
        tempo_preparo TEXT,
        ingredientes TEXT NOT NULL,
        modo_preparo TEXT NOT NULL,
        imagem TEXT,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Índices para melhor performance
    await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_favoritos_user 
      ON favoritos(user_id)
    `);

    await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_receitas_usuario_user 
      ON receitas_usuario(user_id)
    `);

    db.close();
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

module.exports = {
  getDb,
  runQuery,
  getQuery,
  allQuery,
  initDb
};
