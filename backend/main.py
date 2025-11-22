from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['SECRET_KEY'])

# Habilita CORS
CORS(app)

# Importa e registra os blueprints
from routes.auth_routes import auth_bp
from routes.receitas_routes import receitas_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(receitas_bp)  # SEM prefixo, mantém URLs antigas

@app.route('/')
def index():
    return {
        'status': 'online',
        'endpoints': {
            'auth': {
                'registro': 'POST /auth/registro',
                'login': 'POST /auth/login',
                'perfil': 'GET /auth/perfil (requer token)'
            },
            'receitas': {
                'buscar': 'GET /receitas?ingredientes=x,y&pagina=1',
                'detalhes': 'GET /receitas/<id>',
                'surpresa': 'GET /receitas/surpresa',
                'favoritar': 'POST /receitas/<id>/favoritar (requer token)',
                'favoritos': 'GET /receitas/favoritos?pagina=1 (requer token)',
                'minhas': 'GET /receitas/minhas?pagina=1 (requer token)',
                'criar': 'POST /receitas (requer token)'
            }
        }
    }

if __name__ == '__main__':
    # Inicializa o banco de dados
    from database.db_setup import init_db
    init_db()
    
    # Configurações do servidor
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    app.run(debug=debug, host=host, port=port)