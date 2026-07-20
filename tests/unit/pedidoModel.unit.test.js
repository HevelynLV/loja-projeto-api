const mongoose = require('mongoose');
const Pedido = require('../../src/models/Pedido');

describe('Pedido model - validação de schema', () => {
  it('deve ser inválido se o array de itens estiver vazio', () => {
    const pedido = new Pedido({
      usuarioId: new mongoose.Types.ObjectId(),
      itens: [],
      valorTotal: 0,
      status: 'pendente'
    });

    const erro = pedido.validateSync();

    expect(erro.errors.itens.message).toBe('O pedido precisa ter ao menos um item.');
  });
});