# PlateCraft Backend - Node.js

Backend da aplicação PlateCraft convertido de Python (Flask) para Node.js (Express).

## 📋 Pré-requisitos

- Node.js 14+ instalado
- npm ou yarn

## 🚀 Instalação

1. Clone ou navegue até a pasta do projeto:
```bash
cd backendNode
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
HOST=0.0.0.0
PORT=5000
NODE_ENV=development
DB_PATH=receitas_tudogostoso.db
SECRET_KEY=sua-chave-secreta
JWT_SECRET_KEY=sua-chave-jwt
TOKEN_EXPIRATION_DAYS=30
CORS_ORIGIN=*
```

## 🏃 Executando o servidor

### Modo desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Modo produção:
```bash
npm start
```

O servidor estará disponível em `http://localhost:5000`

## 📚 Endpoints da API

### Autenticação

#### Registro
```
POST /auth/registro
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

#### Perfil (requer token)
```
GET /auth/perfil
Authorization: Bearer <token>
```

### Receitas

#### Buscar receitas por ingredientes
```
GET /receitas?ingredientes=tomate,cebola&pagina=1
```

#### Detalhes de uma receita
```
GET /receitas/<id>
```

#### Receita surpresa
```
GET /receitas/surpresa
```

#### Favoritar/Desfavoritar (requer token)
```
POST /receitas/<id>/favoritar
Authorization: Bearer <token>
```

#### Listar favoritos (requer token)
```
GET /receitas/favoritos?pagina=1
Authorization: Bearer <token>
```

#### Listar minhas receitas (requer token)
```
GET /receitas/minhas?pagina=1
Authorization: Bearer <token>
```

#### Criar receita (requer token)
```
POST /receitas
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Bolo de Chocolate",
  "descricao": "Um delicioso bolo de chocolate",
  "tempo_preparo": "30 minutos",
  "ingredientes": ["chocolate", "ovos", "farinha"],
  "modo_preparo": ["Misture os ingredientes", "Asse por 30 minutos"],
  "imagem": "url-da-imagem"
}
```

#### Detalhes de uma receita do usuário (requer token)
```
GET /receitas/minhas/<id>
Authorization: Bearer <token>
```

## 🗄️ Banco de Dados

O banco de dados SQLite é criado automaticamente na primeira execução. As tabelas criadas são:

- **users**: Armazena dados dos usuários
- **favoritos**: Armazena receitas favoritadas pelos usuários
- **receitas_usuario**: Armazena receitas criadas pelos usuários

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. O token deve ser enviado no header:

```
Authorization: Bearer <seu-token-aqui>
```

## 📦 Dependências

- **express**: Framework web
- **cors**: Middleware para CORS
- **bcryptjs**: Hash de senhas
- **jsonwebtoken**: Geração e validação de JWT
- **dotenv**: Carregamento de variáveis de ambiente
- **sqlite3**: Driver SQLite

## 🛠️ Estrutura do Projeto

```
backendNode/
├── src/
│   ├── database/
│   │   └── dbSetup.js          # Configuração do banco de dados
│   ├── middleware/
│   │   └── authMiddleware.js   # Middleware de autenticação
│   ├── routes/
│   │   ├── authRoutes.js       # Rotas de autenticação
│   │   └── receitasRoutes.js   # Rotas de receitas
│   ├── utils/
│   │   ├── responses.js        # Utilitários de resposta
│   │   └── receitasUtils.js    # Utilitários de receitas
│   └── main.js                 # Arquivo principal
├── .env.example                # Exemplo de variáveis de ambiente
├── .gitignore                  # Arquivos ignorados pelo git
├── package.json                # Dependências do projeto
└── README.md                   # Este arquivo
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'sqlite3'"
Instale as dependências novamente:
```bash
npm install
```

### Erro: "EADDRINUSE: address already in use"
A porta já está em uso. Mude a porta no arquivo `.env`:
```env
PORT=5001
```

### Erro: "Database is locked"
Feche outras instâncias do servidor e tente novamente.

## 📝 Notas de Migração

Este backend foi convertido de Python (Flask) para Node.js (Express). As principais mudanças:

- **Framework**: Flask → Express
- **Banco de dados**: sqlite3 (Python) → sqlite3 (Node.js)
- **Hash de senhas**: bcrypt (Python) → bcryptjs (Node.js)
- **JWT**: PyJWT → jsonwebtoken
- **Async/Await**: Promises em vez de callbacks

A funcionalidade permanece a mesma, com os mesmos endpoints e comportamentos.

## 📄 Licença

ISC

## 👨‍💻 Autor

Convertido de Python para Node.js
