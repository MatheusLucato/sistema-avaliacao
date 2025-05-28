# Sistema de Avaliação

Sistema de avaliação de funcionários para postos de combustível.

## Funcionalidades

- Formulário de avaliação para clientes
- Painel de visualização das avaliações
- Armazenamento de dados no MongoDB

## Requisitos

- Node.js 14 ou superior
- NPM ou Yarn
- MongoDB (para desenvolvimento local)

## Instalação Local

1. Clone o repositório
```
git clone [URL_DO_REPOSITORIO]
cd sistema-avaliacao
```

2. Instale as dependências
```
npm install
```

3. Configure o MongoDB
   - Para desenvolvimento local, instale o MongoDB ou use MongoDB Atlas
   - Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=sua_url_de_conexao_mongodb
   ADMIN_PASSWORD=sua_senha_admin
   ```

4. Inicie o servidor
```
npm start
```

5. Acesse o sistema em `http://localhost:3000`