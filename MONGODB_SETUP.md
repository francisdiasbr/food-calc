# Guia de Configuração MongoDB

## ✅ MongoDB já está implementado!

O projeto já está configurado para usar MongoDB como banco de dados persistente. Você só precisa configurar a conexão.

## Opção 1: MongoDB Local (Recomendado para desenvolvimento)

### Instalar MongoDB localmente

**macOS (com Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
1. Baixe o instalador em: https://www.mongodb.com/try/download/community
2. Execute o instalador e siga as instruções
3. O MongoDB iniciará automaticamente como serviço

**Docker (qualquer sistema):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Configurar conexão local

1. Crie o arquivo `.env` no diretório `packages/backend`:
```bash
cd packages/backend
cp .env.example .env
```

2. Edite o arquivo `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/food-calc
```

3. Inicie o backend:
```bash
npm run dev:backend
```

Você deve ver: `✅ MongoDB conectado com sucesso`

---

## Opção 2: MongoDB Atlas (Cloud - Recomendado para produção)

### Criar conta no MongoDB Atlas

1. Acesse: https://www.mongodb.com/cloud/atlas
2. Crie uma conta gratuita (M0 - Free Tier)
3. Crie um novo cluster (escolha a região mais próxima)
4. Configure acesso:
   - **Database Access**: Crie um usuário e senha
   - **Network Access**: Adicione `0.0.0.0/0` para permitir conexões de qualquer IP (ou seu IP específico)

### Obter Connection String

1. No MongoDB Atlas, clique em **"Connect"** no seu cluster
2. Escolha **"Connect your application"**
3. Copie a connection string (algo como):
   ```
   mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Configurar conexão Atlas

1. Edite o arquivo `packages/backend/.env`:
```env
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster0.xxxxx.mongodb.net/food-calc?retryWrites=true&w=majority
```

**Importante:**
- Substitua `<password>` pela senha real (sem os `<>`)
- Substitua `cluster0.xxxxx.mongodb.net` pelo host do seu cluster
- Adicione `/food-calc` antes do `?` para especificar o database

2. Inicie o backend:
```bash
npm run dev:backend
```

---

## Verificar se está funcionando

### Testar conexão

1. Inicie o backend:
```bash
npm run dev:backend
```

2. Você deve ver no console:
```
✅ MongoDB conectado com sucesso
Server running on http://localhost:3001
```

### Verificar dados no MongoDB

**MongoDB Local:**
```bash
# Conectar ao MongoDB shell
mongosh

# Ou versão antiga
mongo

# Listar databases
show dbs

# Usar o database
use food-calc

# Ver collections
show collections

# Ver documentos
db.meals.find()
db.userprofile.find()
```

**MongoDB Atlas:**
- Acesse o MongoDB Atlas Dashboard
- Vá em "Browse Collections"
- Você verá as collections `meals` e `userprofile`

---

## Estrutura das Collections

### Collection: `meals`
Armazena todas as refeições salvas pelos usuários.

### Collection: `userprofile`
Armazena o perfil do usuário (apenas 1 documento).

---

## Troubleshooting

### Erro: "MongoServerError: connect ECONNREFUSED"
- **Causa**: MongoDB não está rodando localmente
- **Solução**: Inicie o MongoDB (`brew services start mongodb-community` ou `sudo systemctl start mongod`)

### Erro: "MongoServerError: Authentication failed"
- **Causa**: Usuário ou senha incorretos no MongoDB Atlas
- **Solução**: Verifique as credenciais no arquivo `.env`

### Erro: "MongoNetworkError: getaddrinfo ENOTFOUND"
- **Causa**: Host do MongoDB Atlas incorreto ou sem acesso à internet
- **Solução**: Verifique a connection string e sua conexão com a internet

### Erro: "IP not whitelisted"
- **Causa**: Seu IP não está na lista de acesso do MongoDB Atlas
- **Solução**: Adicione seu IP em "Network Access" no MongoDB Atlas (ou use `0.0.0.0/0` para desenvolvimento)

---

## Próximos passos

1. ✅ Configure o `.env` com sua `MONGODB_URI`
2. ✅ Inicie o backend: `npm run dev:backend`
3. ✅ Inicie o frontend: `npm run dev:frontend`
4. ✅ Teste salvando uma refeição no app
5. ✅ Verifique os dados no MongoDB

Os dados agora são persistidos permanentemente no MongoDB! 🎉

