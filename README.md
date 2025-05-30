# Sistema de Avaliação

Sistema de avaliação de funcionários desenvolvido com Node.js, Express e MongoDB.

## Funcionalidades

- Formulário de avaliação para clientes
- Painel de visualização das avaliações
- Armazenamento de dados no MongoDB

## Requisitos

- Node.js 14 ou superior
- NPM ou Yarn
- MongoDB Atlas (ou MongoDB local)

## Instalação

1. Clone o repositório:
```
git clone https://github.com/seu-usuario/sistema-avaliacao.git
cd sistema-avaliacao
```

2. Instale as dependências:
```
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@seu_cluster.mongodb.net/seu_banco_de_dados
PORT=3000
ADMIN_PASSWORD=sua_senha_admin
```

## Execução

Para executar em ambiente de desenvolvimento:
```
npm run dev
```

Para executar em produção:
```
npm start
```

## Deploy na Vercel

Este projeto está configurado para deploy na Vercel:

1. Crie uma conta na [Vercel](https://vercel.com/) caso ainda não tenha
2. Instale a CLI da Vercel:
```
npm i -g vercel
```

3. Faça login na sua conta:
```
vercel login
```

4. Deploy do projeto:
```
vercel
```

5. Para produção:
```
vercel --prod
```

### Configuração de variáveis de ambiente na Vercel

Após o primeiro deploy, configure as variáveis de ambiente no dashboard da Vercel:

1. Acesse o projeto no dashboard da Vercel
2. Vá para "Settings" > "Environment Variables"
3. Adicione as seguintes variáveis:
   - `MONGODB_URI`: String de conexão do MongoDB Atlas
   - `ADMIN_PASSWORD`: Senha para acesso administrativo

## Estrutura do Projeto

- `server.js`: Ponto de entrada da aplicação
- `config/`: Configurações do banco de dados
- `models/`: Modelos de dados
- `public/`: Arquivos estáticos (HTML, CSS, JS)

## Licença

ISC