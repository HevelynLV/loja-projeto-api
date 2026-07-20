const mongoose = require('mongoose');

const itemPedidoSchema = new mongoose.Schema({
  produtoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produto',
    required: true
  },
  nome: {
    type: String,
    required: true
  },
  precoUnitario: {
    type: Number,
    required: true,
    min: 0
  },
  quantidade: {
    type: Number,
    required: true,
    min: 1
  }
});

const pedidoSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  itens: {
    type: [itemPedidoSchema],
    required: true,
    validate: {
      validator: function (itens) {
        return itens.length > 0;
      },
      message: 'O pedido precisa ter ao menos um item.'
    }
  },
  valorTotal: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'],
    default: 'pendente'
  }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);