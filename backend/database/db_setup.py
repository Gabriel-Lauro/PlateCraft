import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv('DB_PATH', 'receitas_tudogostoso.db')

def get_db():
    """Retorna uma conexão com o banco de dados"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"DB Error: {e}")
        return None

def init_db():
    """Inicializa as tabelas necessárias no banco de dados"""
    conn = get_db()
    if not conn:
        print("Erro ao conectar no banco de dados!")
        return
    
    cursor = conn.cursor()
    
    # Tabela de usuários
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Tabela de receitas favoritas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS favoritos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            recipe_id INTEGER NOT NULL,
            data_favoritado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (recipe_id) REFERENCES recipes(id),
            UNIQUE(user_id, recipe_id)
        )
    """)
    
    # Tabela de receitas enviadas pelos usuários
    cursor.execute("""
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
    """)
    
    # Índices para melhor performance
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_favoritos_user 
        ON favoritos(user_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_receitas_usuario_user 
        ON receitas_usuario(user_id)
    """)
    
    conn.commit()
    conn.close()
    print("Banco de dados inicializado com sucesso!")

if __name__ == "__main__":
    init_db()