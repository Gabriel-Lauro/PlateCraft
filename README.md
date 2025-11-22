# PlateCraft
**Transforme suas sobras em pratos incríveis!**

## 📱 Descrição do Projeto
O PlateCraft é um aplicativo mobile desenvolvido com React Native (Expo) que combate o desperdício de alimentos domésticos, oferecendo uma solução prática e inteligente para aproveitamento de ingredientes disponíveis em casa.

## 🎯 Problema Identificado
O desperdício de alimentos é uma realidade presente na maioria dos lares brasileiros. Muitas vezes, ingredientes ficam esquecidos na geladeira ou despensa, resultando em perda de alimentos e recursos financeiros. Essa situação se agrava especialmente em residências com muitos moradores, onde as compras são realizadas em maior quantidade.

## 💡 Solução Proposta
O PlateCraft permite que os usuários insiram os ingredientes disponíveis em suas casas e recebam sugestões de receitas personalizadas, otimizando o uso dos alimentos e evitando o desperdício. O aplicativo é especialmente útil para:

- ✅ Aproveitamento de sobras e ingredientes próximos ao vencimento
- ✅ Economia no final do mês
- ✅ Descoberta de novas combinações culinárias
- ✅ Planejamento de refeições com base no que está disponível

---

## 🏗️ Arquitetura do Projeto

### Frontend (React Native + Expo)
- **Framework**: React Native com Expo
- **Linguagem**: JavaScript
- **Gerenciamento de Estado**: Context API
- **Armazenamento Local**: AsyncStorage
- **Autenticação**: JWT Token

**Estrutura de Pastas:**
```
frontend/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── BottomNav/     # Navegação inferior
│   │   ├── ReceitaCard/   # Card de receita
│   │   ├── SearchBar/     # Barra de busca
│   │   ├── SkeletonLoader/# Carregamento
│   │   └── ...
│   ├── pages/             # Telas do aplicativo
│   │   ├── home/          # Tela inicial
│   │   ├── login/         # Autenticação
│   │   ├── receitaDetalhes/ # Detalhes da receita
│   │   ├── favoritos/     # Receitas favoritas
│   │   ├── surpresa/      # Receita aleatória
│   │   ├── profile/       # Perfil do usuário
│   │   └── noInternet/    # Sem conexão
│   ├── services/          # Chamadas à API
│   ├── context/           # Context API
│   ├── hooks/             # Custom hooks
│   └── config/            # Configurações
├── App.js                 # Componente raiz
└── package.json
```

### Backend (Flask + Python)
- **Framework**: Flask 3.0.0
- **Linguagem**: Python
- **Banco de Dados**: SQLite
- **Autenticação**: JWT + bcrypt
- **CORS**: Habilitado para requisições do frontend

**Estrutura de Pastas:**
```
backend/
├── database/
│   └── db_setup.py        # Inicialização do banco
├── routes/
│   ├── auth_routes.py     # Autenticação (login, registro)
│   └── receitas_routes.py # Operações com receitas
├── utils/
│   ├── receitas_utils.py  # Lógica de busca
│   └── responses.py       # Formatação de respostas
├── main.py                # Aplicação principal
└── requirements.txt       # Dependências
```

---

## 🔄 Como Funciona

### Fluxo Principal do Aplicativo

1. **Autenticação**
   - Usuário faz login ou se registra
   - Sistema gera JWT token válido por 30 dias
   - Token armazenado localmente no AsyncStorage

2. **Tela Inicial (Home)**
   - Campo de busca para inserir ingredientes
   - Usuário digita ingredientes separados por vírgula
   - Busca em tempo real de receitas

3. **Busca de Receitas**
   - Sistema busca receitas compatíveis no banco de dados
   - Resultados paginados (10 por página)
   - Exibição em cards com imagem, título e avaliação

4. **Detalhes da Receita**
   - Visualização completa com ingredientes
   - Modo de preparo passo a passo
   - Avaliação e autor
   - Tempo de preparo
   - Opção de favoritar

5. **Funcionalidades Adicionais**
   - **Favoritos**: Salvar receitas preferidas
   - **Surpresa**: Receita aleatória do banco
   - **Perfil**: Visualizar dados e estatísticas
   - **Minhas Receitas**: Receitas criadas pelo usuário

---

## 📡 API REST - Endpoints

### Autenticação (`/auth`)

#### Registro
```
POST /auth/registro
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}

Resposta (201):
{
  "sucesso": true,
  "mensagem": "Usuário registrado com sucesso",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com"
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "senha": "senha123"
}

Resposta (200):
{
  "sucesso": true,
  "mensagem": "Login realizado com sucesso",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com"
  }
}
```

#### Perfil
```
GET /auth/perfil
Authorization: Bearer {token}

Resposta (200):
{
  "sucesso": true,
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "data_criacao": "2024-01-15",
    "total_favoritos": 5,
    "total_receitas": 2
  }
}
```

### Receitas (`/receitas`)

#### Buscar Receitas por Ingredientes
```
GET /receitas?ingredientes=arroz,feijão&pagina=1

Resposta (200):
{
  "sucesso": true,
  "ingredientes": ["arroz", "feijão"],
  "pagina": 1,
  "total": 25,
  "mostrando": 10,
  "tem_mais": true,
  "receitas": [
    {
      "id": 1,
      "titulo": "Arroz com Feijão",
      "nota": 4.5,
      "avaliacoes": 120,
      "autor": "Chef João",
      "tempo_preparo": "30 min",
      "imagem": "https://...",
      "link": "https://..."
    },
    ...
  ]
}
```

#### Detalhes da Receita
```
GET /receitas/{id}

Resposta (200):
{
  "sucesso": true,
  "receita": {
    "id": 1,
    "titulo": "Arroz com Feijão",
    "nota": 4.5,
    "avaliacoes": 120,
    "autor": "Chef João",
    "tempo_preparo": "30 min",
    "imagem": "https://...",
    "descricao": "Receita tradicional...",
    "ingredientes": [
      "2 xícaras de arroz",
      "1 xícara de feijão",
      "Sal a gosto"
    ],
    "modo_preparo": [
      "Lave o arroz em água corrente",
      "Cozinhe o feijão até ficar macio",
      "Misture os ingredientes"
    ]
  }
}
```

#### Receita Surpresa
```
GET /receitas/surpresa

Resposta (200):
{
  "sucesso": true,
  "mensagem": "Receita surpresa! 🎉",
  "receita": { ... }
}
```

#### Favoritar/Desfavoritar
```
POST /receitas/{id}/favoritar
Authorization: Bearer {token}

Resposta (200):
{
  "sucesso": true,
  "mensagem": "Receita adicionada aos favoritos",
  "favoritado": true
}
```

#### Listar Favoritos
```
GET /receitas/favoritos?pagina=1
Authorization: Bearer {token}

Resposta (200):
{
  "sucesso": true,
  "pagina": 1,
  "total": 5,
  "mostrando": 5,
  "tem_mais": false,
  "receitas": [ ... ]
}
```

#### Listar Minhas Receitas
```
GET /receitas/minhas?pagina=1
Authorization: Bearer {token}

Resposta (200):
{
  "sucesso": true,
  "pagina": 1,
  "total": 2,
  "mostrando": 2,
  "tem_mais": false,
  "receitas": [ ... ]
}
```

#### Criar Receita
```
POST /receitas
Authorization: Bearer {token}
Content-Type: application/json

{
  "titulo": "Minha Receita",
  "descricao": "Uma receita especial",
  "tempo_preparo": "45 min",
  "ingredientes": [
    "2 xícaras de farinha",
    "1 ovo"
  ],
  "modo_preparo": [
    "Misture os ingredientes",
    "Asse por 30 minutos"
  ],
  "imagem": "https://..."
}

Resposta (201):
{
  "sucesso": true,
  "mensagem": "Receita criada com sucesso",
  "receita_id": 42
}
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `users`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER PK | ID único do usuário |
| nome | TEXT | Nome completo |
| email | TEXT UNIQUE | Email para login |
| senha_hash | TEXT | Senha criptografada com bcrypt |
| data_criacao | DATETIME | Data de registro |

### Tabela: `recipes`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER PK | ID único da receita |
| titulo | TEXT | Nome da receita |
| nota | FLOAT | Avaliação média |
| avaliacoes | INTEGER | Quantidade de avaliações |
| autor | TEXT | Autor da receita |
| tempo_preparo | TEXT | Tempo estimado |
| link | TEXT | Link da fonte |
| imagem | TEXT | URL da imagem |
| descricao | TEXT | Descrição da receita |
| informacoes_adicionais | TEXT | Informações extras |

### Tabela: `ingredients`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER PK | ID único |
| recipe_id | INTEGER FK | Referência à receita |
| item | TEXT | Nome do ingrediente |

### Tabela: `recipe_steps`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER PK | ID único |
| recipe_id | INTEGER FK | Referência à receita |
| position | INTEGER | Ordem do passo |
| text | TEXT | Descrição do passo |

### Tabela: `favoritos`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER PK | ID único |
| user_id | INTEGER FK | Referência ao usuário |
| recipe_id | INTEGER FK | Referência à receita |
| data_favoritado | DATETIME | Data de favoritação |

### Tabela: `receitas_usuario`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER PK | ID único |
| user_id | INTEGER FK | Referência ao usuário |
| titulo | TEXT | Título da receita |
| descricao | TEXT | Descrição |
| tempo_preparo | TEXT | Tempo estimado |
| ingredientes | TEXT | Ingredientes (separados por quebra de linha) |
| modo_preparo | TEXT | Modo de preparo (separado por quebra de linha) |
| imagem | TEXT | URL da imagem |
| data_criacao | DATETIME | Data de criação |

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+
- Python 3.8+
- npm ou yarn

### Backend

1. **Instalar dependências**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configurar variáveis de ambiente**
Criar arquivo `.env` na pasta `backend`:
```
FLASK_DEBUG=True
HOST=0.0.0.0
PORT=5000
SECRET_KEY=sua-chave-secreta-aqui
JWT_SECRET_KEY=sua-chave-jwt-aqui
TOKEN_EXPIRATION_DAYS=30
```

3. **Executar servidor**
```bash
python main.py
```

O servidor estará disponível em `http://localhost:5000`

### Frontend

1. **Instalar dependências**
```bash
cd frontend
npm install
```

2. **Configurar URL da API**
Editar `frontend/src/config/api.js`:
```javascript
const API_URL = 'http://seu-ip-local:5000';
```

3. **Executar aplicativo**

Para web:
```bash
npm run web
```

Para Android:
```bash
npm run android
```

Para iOS:
```bash
npm run ios
```

---

## 🎨 Tecnologias Utilizadas

### Frontend
- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **React Context API** - Gerenciamento de estado
- **AsyncStorage** - Armazenamento local
- **Axios** - Cliente HTTP
- **Styled Components** - Estilização

### Backend
- **Flask** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senha
- **Flask-CORS** - Suporte a CORS

---

## 📋 Funcionalidades Implementadas

### Autenticação
- ✅ Registro de novo usuário
- ✅ Login com email e senha
- ✅ Autenticação via JWT
- ✅ Tokens com expiração de 30 dias
- ✅ Perfil do usuário

### Busca de Receitas
- ✅ Busca por ingredientes
- ✅ Paginação de resultados (10 por página)
- ✅ Detalhes completos da receita
- ✅ Receita aleatória (Surpresa)

### Favoritos
- ✅ Adicionar/remover favoritos
- ✅ Listar receitas favoritas
- ✅ Persistência de favoritos

### Receitas do Usuário
- ✅ Criar novas receitas
- ✅ Listar minhas receitas
- ✅ Visualizar detalhes

### Interface
- ✅ Navegação por abas
- ✅ Carregamento com skeleton loader
- ✅ Detecção de conexão de internet
- ✅ Design responsivo

---

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT
- CORS configurado
- Validação de entrada em todas as rotas
- Proteção de rotas autenticadas

---

## 📱 Telas do Aplicativo

1. **Login** - Autenticação do usuário
2. **Home** - Busca de receitas por ingredientes
3. **Resultados** - Lista de receitas encontradas
4. **Detalhes** - Informações completas da receita
5. **Favoritos** - Receitas salvas pelo usuário
6. **Surpresa** - Receita aleatória
7. **Perfil** - Dados do usuário e estatísticas
8. **Sem Internet** - Mensagem quando não há conexão

---

## 🎯 Protótipo
Acesse o protótipo visual do aplicativo no Figma: [PlateCraft - Protótipo](https://www.figma.com/design/Aw0qqlWACh1ZJaazzG7HH7)

---

## 💡 Justificativa Pessoal
Este projeto nasceu da necessidade real observada em uma residência com muitos moradores, onde as compras são realizadas em grande quantidade e frequentemente resultam em sobras. O PlateCraft oferece uma solução prática para transformar esses ingredientes "esquecidos" em refeições deliciosas, contribuindo tanto para a economia doméstica quanto para a sustentabilidade.

---

## 🌱 Benefícios Esperados
- Redução do desperdício alimentar em nível doméstico
- Economia financeira através do melhor aproveitamento dos alimentos
- Descoberta culinária com novas receitas e combinações
- Consciência sustentável promovendo hábitos mais responsáveis
- Praticidade no planejamento de refeições

---

## 📄 Licença
Este projeto está sob a licença especificada no arquivo LICENSE.

---

## 👨‍💻 Autor
Desenvolvido com ❤️ para combater o desperdício de alimentos.
