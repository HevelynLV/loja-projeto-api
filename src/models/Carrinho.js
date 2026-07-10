const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produto',
    required: [true, 'O produto é obrigatório.'],
  },
  quantidade: {
    type: Number,
    required: [true, 'A quantidade é obrigatória.'],
    min: [1, 'A quantidade deve ser no mínimo 1.'],
  },
}, { _id: true });

const carrinhoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O usuário é obrigatório.'],
    unique: true,
  },
  itens: [itemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Carrinho', carrinhoSchema);