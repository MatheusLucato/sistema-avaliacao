const mongoose = require('mongoose');

const avaliacaoSchema = new mongoose.Schema({
  nome_cliente: {
    type: String,
    required: true,
    trim: true
  },
  nome_funcionario: {
    type: String,
    required: true,
    trim: true
  },
  pontuacao: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    trim: true
  },
  telefone_avaliador: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10,11}$/.test(v);
      },
      message: props => 'O telefone deve ter entre 10 e 11 dígitos, incluindo o DDD.'
    }
  },
  email_avaliador: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, forneça um endereço de email válido.']
  },
  data_experiencia: {
    type: Date,
    required: true,
    validate: {
      validator: function(data) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        trintaDiasAtras.setHours(0, 0, 0, 0);
        
        return data <= hoje && data >= trintaDiasAtras;
      },
      message: 'A data da experiência não pode ser no futuro nem mais de 30 dias atrás.'
    }
  },
  data: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Avaliacao = mongoose.model('Avaliacao', avaliacaoSchema);

module.exports = Avaliacao; 