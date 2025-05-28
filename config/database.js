const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Erro: Variável de ambiente MONGODB_URI não definida!');
  console.error('Por favor, defina a variável de ambiente MONGODB_URI com a string de conexão do MongoDB Atlas');
  process.exit(1);
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    
    await conn.connection.db.admin().command({ ping: 1 });
    console.log("Ping bem-sucedido! Conexão estabelecida com o MongoDB Atlas.");
    
    return conn;
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB }; 