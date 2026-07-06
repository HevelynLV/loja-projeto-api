const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome do produto é obrigatório'],
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
    preco: {
      type: Number,
      required: [true, 'O preço é obrigatório'],
      min: [0, 'O preço não pode ser negativo'],
    },
    estoque: {
      type: Number,
      required: true,
      min: [0, 'O estoque não pode ser negativo'],
      default: 0,
    },
    categoria: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Produto', produtoSchema);