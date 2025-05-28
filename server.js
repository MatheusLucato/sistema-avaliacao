const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const { connectDB } = require('./config/database');

const Avaliacao = require('./models/Avaliacao');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function validarData(dataStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dataStr)) {
    return { valido: false, mensagem: 'Formato de data inválido.' };
  }
  
  const data = new Date(dataStr);
  if (isNaN(data.getTime())) {
    return { valido: false, mensagem: 'Data inválida.' };
  }
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  if (data > hoje) {
    return { valido: false, mensagem: 'A data da experiência não pode ser no futuro.' };
  }
  
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(hoje.getDate() - 30);
  trintaDiasAtras.setHours(0, 0, 0, 0);
  
  if (data < trintaDiasAtras) {
    return { valido: false, mensagem: 'A data da experiência não pode ser mais de 30 dias atrás.' };
  }
  
  return { valido: true };
}

function validarTelefone(telefone) {
  if (typeof telefone !== 'string') {
    return { valido: false, mensagem: 'O telefone deve ser uma string.' };
  }
  
  if (!/^\d+$/.test(telefone)) {
    return { valido: false, mensagem: 'O telefone deve conter apenas números.' };
  }
  
  if (telefone.length < 10 || telefone.length > 11) {
    return { valido: false, mensagem: 'O telefone deve ter entre 10 e 11 dígitos, incluindo o DDD.' };
  }
  
  return { valido: true };
}

app.get('/api/avaliacoes', async (req, res) => {
  try {
    const avaliacoes = await Avaliacao.find().sort({ data: -1 });
    
    const avaliacoesComId = avaliacoes.map(avaliacao => {
      const avaliacaoObj = avaliacao.toObject();
      avaliacaoObj.id = avaliacao._id.toString();
      return avaliacaoObj;
    });
    
    res.json(avaliacoesComId);
  } catch (err) {
    console.error('Erro ao buscar avaliações:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/avaliacoes', async (req, res) => {
  try {
    const { nome_cliente, nome_funcionario, pontuacao, comentario, telefone_avaliador, email_avaliador, data_experiencia } = req.body;
    
    if (!nome_cliente || !nome_funcionario || !pontuacao || !telefone_avaliador || !data_experiencia) {
      return res.status(400).json({ error: 'Nome do cliente, nome do funcionário, pontuação, data da experiência e telefone do avaliador são obrigatórios' });
    }
    
    const validacaoData = validarData(data_experiencia);
    if (!validacaoData.valido) {
      return res.status(400).json({ error: validacaoData.mensagem });
    }
    
    const validacaoTelefone = validarTelefone(telefone_avaliador);
    if (!validacaoTelefone.valido) {
      return res.status(400).json({ error: validacaoTelefone.mensagem });
    }

    const novaAvaliacao = new Avaliacao({
      nome_cliente,
      nome_funcionario,
      pontuacao,
      comentario,
      telefone_avaliador,
      email_avaliador,
      data_experiencia: new Date(data_experiencia),
      data: new Date()
    });

    const avaliacaoSalva = await novaAvaliacao.save();
    res.json(avaliacaoSalva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/avaliacoes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const requestId = req.query.requestId || 'sem-id';
    
    
    if (!id || id === 'undefined') {
      console.error(`[${requestId}] ID inválido recebido na rota de exclusão`);
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`[${requestId}] ID não é um ObjectId válido:`, id);
      return res.status(400).json({ error: 'ID no formato inválido' });
    }
    
    const resultado = await Avaliacao.findByIdAndDelete(id);
    
    if (!resultado) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    
    res.json({ message: 'Avaliação excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir avaliação:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/admin/verificar', (req, res) => {
  const { senha } = req.body;
  
  const senhaCorreta = process.env.ADMIN_PASSWORD;
  
  if (!senhaCorreta) {
    console.error('AVISO DE SEGURANÇA: Variável de ambiente ADMIN_PASSWORD não definida!');
    return res.json({ autenticado: false });
  }
  
  const autenticado = senha === senhaCorreta;
  
  res.json({ autenticado });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, fechando servidor e conexão com banco de dados...');
  server.close(() => {
    mongoose.connection.close();
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`Acesse de outras máquinas usando http://<seu-ip-local>:${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error(`Erro ao iniciar o servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer(); 