# PlateCraft 🍳

**Transforme suas sobras em pratos incríveis!**

Um aplicativo mobile que combate o desperdício de alimentos, oferecendo sugestões de receitas personalizadas baseadas nos ingredientes disponíveis em casa.

---

## 📁 Estrutura do Projeto

```
PlateCraft/
├── app/                          # Frontend (React Native + Expo)
│   ├── src/
│   │   ├── components/           # Componentes reutilizáveis
│   │   │   ├── BottomNav/        # Navegação inferior
│   │   │   ├── ReceitaCard/      # Card de receita
│   │   │   ├── SearchBar/        # Barra de busca
│   │   │   ├── SkeletonLoader/   # Carregamento
│   │   │   └── ...
│   │   ├── pages/                # Telas do aplicativo
│   │   │   ├── home/             # Busca de receitas
│   │   │   ├── login/            # Autenticação
│   │   │   ├── receitaDetalhes/  # Detalhes da receita
│   │   │   ├── favoritos/        # Receitas favoritas
│   │   │   ├── surpresa/         # Receita aleatória
│   │   │   ├── profile/          # Perfil do usuário
│   │   │   └── noInternet/       # Sem conexão
│   │   ├── services/             # Chamadas à API
│   │   ├── context/              # Context API (autenticação)
│   │   ├── hooks/                # Custom hooks
│   │   ├── config/               # Configurações (URL da API)
│   │   └── media/                # Imagens e dicionário
│   ├── android/                  # Configurações Android
│   ├── package.json
│   └── app.json
│
├── backendNode/                  # Backend (Express + Node.js)
│   ├── src/
│   │   ├── database/
│   │   │   └── dbSetup.js        # Inicialização do banco SQLite
│   │   ├── middleware/
│   │   │   └── authMiddleware.js # Validação JWT
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # Login, registro, perfil
│   │   │   └── receitasRoutes.js # Busca, favoritos, minhas receitas
│   │   ├── utils/
│   │   │   ├── receitasUtils.js  # Lógica de busca
│   │   │   └── responses.js      # Formatação de respostas
│   │   └── main.js               # Servidor Express
│   ├── .env.example
│   ├── package.json
│   └── recipes.db                # Banco de dados SQLite
│
└── README.md
```

---

## 🔄 Como Funciona

### Fluxo Principal

1. **Autenticação** → Usuário faz login/registro com JWT
2. **Home** → Digita ingredientes separados por vírgula
3. **Busca** → Sistema busca receitas compatíveis no banco
4. **Resultados** → Exibe receitas em cards com paginação
5. **Detalhes** → Visualiza ingredientes, modo de preparo e avaliação
6. **Favoritos** → Salva receitas preferidas localmente
7. **Surpresa** → Receita aleatória do banco

### Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React Native, Expo, Context API, AsyncStorage |
| **Backend** | Express, Node.js, SQLite, JWT, bcryptjs |
| **Autenticação** | JWT com expiração de 30 dias |

---

## 🚀 Como Executar

### Backend (Node.js)

```bash
cd backendNode
npm install
cp .env.example .env
npm run dev
```

Servidor rodará em `http://localhost:5000`

### Frontend

```bash
cd app
npm install
npm start
```

Escolha a plataforma:
- `w` para web
- `a` para Android
- `i` para iOS

---

## 📡 API Endpoints

### Autenticação
- `POST /auth/registro` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `GET /auth/perfil` - Dados do usuário (requer token)

### Receitas
- `GET /receitas?ingredientes=x,y&pagina=1` - Buscar receitas
- `GET /receitas/<id>` - Detalhes da receita
- `GET /receitas/surpresa` - Receita aleatória
- `POST /receitas/<id>/favoritar` - Favoritar receita (requer token)
- `GET /receitas/favoritos?pagina=1` - Listar favoritos (requer token)
- `GET /receitas/minhas?pagina=1` - Minhas receitas (requer token)
- `POST /receitas` - Criar receita (requer token)

---

## 🗄️ Banco de Dados

**Tabelas principais:**
- `users` - Usuários registrados
- `recipes` - Receitas disponíveis
- `ingredients` - Ingredientes de cada receita
- `recipe_steps` - Modo de preparo
- `favoritos` - Receitas favoritadas por usuário
- `receitas_usuario` - Receitas criadas pelos usuários

---

## ✨ Funcionalidades

✅ Busca de receitas por ingredientes  
✅ Autenticação com JWT  
✅ Favoritar receitas  
✅ Receita aleatória (Surpresa)  
✅ Criar receitas personalizadas  
✅ Perfil do usuário com estatísticas  
✅ Detecção de conexão de internet  
✅ Carregamento com skeleton loader  

---

## 📄 Licença

Este projeto está sob a licença especificada no arquivo LICENSE.

---

**Desenvolvido com ❤️ para combater o desperdício de alimentos.**
