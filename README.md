# Food Calc - Calculadora de Calorias

Aplicação full-stack para cálculo e acompanhamento de calorias e nutrientes, utilizando IA para análise nutricional e MongoDB para persistência de dados.

## Estrutura do Projeto

Este é um monorepo gerenciado com npm workspaces:

```
food-calc/
├── packages/
│   ├── frontend/          # Aplicação React + TypeScript (Vite)
│   │   ├── src/
│   │   │   ├── components/    # Componentes React
│   │   │   ├── services/      # Serviços de API
│   │   │   └── types.ts       # Definições TypeScript
│   │   └── ...
│   └── backend/           # API Express + TypeScript + MongoDB
│       ├── src/
│       │   ├── config/        # Configuração do banco de dados
│       │   ├── models/        # Schemas Mongoose
│       │   └── routes/        # Rotas da API
│       └── ...
└── package.json           # Configuração do monorepo
```

## Módulos e Funcionalidades

### Frontend

#### 1. CalorieCalculator (`components/CalorieCalculator.tsx`)
Componente principal para registro de refeições.

**Funcionalidades:**
- Seleção de data e tipo de refeição (café da manhã, lanches, almoço, jantar, ceia)
- Adição dinâmica de múltiplos alimentos por refeição
- Cálculo automático de nutrientes via API OpenAI
- Exibição de macronutrientes (carboidratos, proteínas, gorduras, fibras)
- Exibição de micronutrientes (vitaminas e minerais)
- Comparação com metas diárias do perfil do usuário
- Salvamento automático no banco de dados após cálculo

#### 2. MealHistory (`components/MealHistory.tsx`)
Histórico de refeições registradas.

**Funcionalidades:**
- Listagem de todas as refeições agrupadas por data
- Ordenação cronológica (mais recentes primeiro)
- Cards expansíveis com detalhes nutricionais
- Visualização de calorias totais por refeição
- Exclusão de refeições individuais
- Fallback para localStorage se API indisponível

#### 3. MenuSimulator (`components/MenuSimulator.tsx`)
Simulador de cardápio para planejamento.

**Funcionalidades:**
- Planejamento de refeições sem salvar no banco
- Cálculo de nutrientes em tempo real
- Ideal para cenários "e se?" de planejamento alimentar
- Totais de macro e micronutrientes
- Limpar resultados para recomeçar

#### 4. UserProfileEditor (`components/UserProfileEditor.tsx`)
Gerenciamento do perfil do usuário.

**Funcionalidades:**
- Dados pessoais: idade, sexo, peso, altura, nível de atividade
- Metas de macronutrientes: calorias, proteínas, carboidratos, gorduras, fibras
- Metas de minerais: cálcio, ferro, magnésio, potássio, sódio, zinco, cobre, manganês, selênio, iodo, fósforo
- Metas de vitaminas: A, C, D, E, K, B1, B2, B3, B5, B6, B7, B9, B12
- Opção de resetar para valores padrão
- Persistência em MongoDB

#### 5. API Service (`services/api.ts`)
Camada de abstração para comunicação com o backend.

**Funcionalidades:**
- `mealsAPI`: CRUD completo de refeições
- `profileAPI`: Gerenciamento do perfil do usuário
- Normalização de IDs do MongoDB
- Tratamento de erros com mensagens amigáveis
- Fallback para localStorage em caso de falha

### Backend

#### 1. Servidor Express (`index.ts`)
Servidor HTTP principal.

**Funcionalidades:**
- Execução na porta 3001
- CORS habilitado para comunicação com frontend
- Conexão automática com MongoDB na inicialização
- Montagem de rotas modulares

#### 2. Configuração de Banco (`config/database.ts`)
Conexão com MongoDB.

**Funcionalidades:**
- Conexão via Mongoose
- Suporte a MongoDB local e Atlas
- URI configurável via variável de ambiente

#### 3. Modelo Meal (`models/Meal.ts`)
Schema para refeições.

**Campos:**
- `date`: Data no formato YYYY-MM-DD
- `mealType`: Tipo de refeição (breakfast, snack1, lunch, snack2, dinner, supper)
- `foods`: Array de alimentos com dados nutricionais completos
- `savedAt`: Timestamp de salvamento

**Dados nutricionais por alimento:**
- Calorias, carboidratos, proteínas, gorduras, fibras
- 11 vitaminas (A, C, D, E, K, complexo B)
- 11 minerais (cálcio, ferro, magnésio, etc.)

#### 4. Modelo UserProfile (`models/UserProfile.ts`)
Schema para perfil do usuário (singleton).

**Campos:**
- Dados pessoais: idade, sexo, peso, altura, nível de atividade
- Metas diárias de todos os macro e micronutrientes

#### 5. Rota de Calorias (`routes/calories.ts`)
Cálculo de nutrientes via IA.

**Endpoint:** `POST /api/calories`

**Funcionalidades:**
- Recebe alimento e quantidade
- Utiliza GPT-4o-mini para análise nutricional
- Retorna JSON estruturado com todos os nutrientes
- Lazy loading do cliente OpenAI

#### 6. Rota de Refeições (`routes/meals.ts`)
CRUD de refeições.

**Endpoints:**
- `GET /api/meals` - Listar todas as refeições
- `GET /api/meals/:id` - Buscar refeição específica
- `POST /api/meals` - Criar nova refeição
- `PUT /api/meals/:id` - Atualizar refeição
- `DELETE /api/meals/:id` - Deletar refeição

#### 7. Rota de Perfil (`routes/profile.ts`)
Gerenciamento de perfil.

**Endpoints:**
- `GET /api/profile` - Buscar perfil do usuário
- `POST /api/profile` - Criar ou atualizar perfil (upsert)
- `PUT /api/profile` - Atualizar perfil

## Tecnologias

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server

### Backend
- **Express.js** - Framework HTTP
- **TypeScript** - Tipagem estática
- **Mongoose** - ODM para MongoDB
- **OpenAI API** - GPT-4o-mini para análise nutricional

### Banco de Dados
- **MongoDB** - Banco de dados NoSQL

## Pré-requisitos

- Node.js (v18 ou superior)
- MongoDB (local ou MongoDB Atlas)
- OpenAI API Key (para cálculo de nutrientes)

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

No diretório `packages/backend`, crie um arquivo `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/food-calc
PORT=3001
```

**Para MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-calc
```

### 3. Iniciar MongoDB (se local)

```bash
# macOS (com Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Ou usando Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Executar aplicação

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

A aplicação estará disponível em:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Fluxo de Dados

### Adicionar Refeição
1. Usuário seleciona data, tipo de refeição e adiciona alimentos
2. Frontend envia cada alimento para `/api/calories`
3. OpenAI retorna dados nutricionais detalhados
4. Frontend agrega nutrientes de todos os alimentos
5. Refeição é salva automaticamente em `/api/meals`

### Visualizar Histórico
1. Frontend carrega refeições de `/api/meals`
2. Refeições são agrupadas por data
3. Usuário pode expandir detalhes ou excluir refeições

### Gerenciar Perfil
1. Perfil é carregado de `/api/profile`
2. Usuário edita dados pessoais e metas nutricionais
3. Alterações são salvas no MongoDB

## Fallback e Resiliência

O frontend mantém fallback para localStorage caso a API não esteja disponível, permitindo uso offline e migração gradual de dados.
