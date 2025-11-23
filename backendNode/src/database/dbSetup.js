const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const USERS_DB_PATH = process.env.USERS_DB_PATH || 'users.db';
const RECIPES_DB_PATH = process.env.RECIPES_DB_PATH || 'recipes.db';

/**
 * Conexões com os bancos de dados
 */
function getUsersDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(USERS_DB_PATH, (err) => {
      if (err) {
        console.error('Users DB Error:', err);
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

function getRecipesDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(RECIPES_DB_PATH, (err) => {
      if (err) {
        console.error('Recipes DB Error:', err);
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

/**
 * Helpers para queries
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
 * Inicializa as tabelas necessárias no users.db
 */
async function initDb() {
  try {
    const db = await getUsersDb();

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

    // Tabela de receitas favoritas (sem FK para recipes pois está em outro DB)
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS favoritos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        recipe_id INTEGER NOT NULL,
        data_favoritado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
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

    // Índices
    await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_favoritos_user 
      ON favoritos(user_id)
    `);

    await runQuery(db, `
      CREATE INDEX IF NOT EXISTS idx_receitas_usuario_user 
      ON receitas_usuario(user_id)
    `);

    db.close();
    console.log('Users DB inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar users DB:', error);
  }
}

module.exports = {
  getUsersDb,
  getRecipesDb,
  runQuery,
  getQuery,
  allQuery,
  initDb
};
