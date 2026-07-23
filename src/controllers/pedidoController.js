const Carrinho = require('../models/Carrinho');
const Pedido = require('../models/Pedido');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { transicaoValida } = require('../utils/transicaoStatus');

const criarPedido = asyncHandler(async (req, res) => {
  const { usuarioId } = req;

  const carrinho = await Carrinho.findOne({ usuario: usuarioId }).populate('itens.produto');

  if (!carrinho || carrinho.itens.length === 0) {
    throw new AppError('Carrinho vazio ou não encontrado.', 400);
  }

  const itensPedido = carrinho.itens.map((item) => {
    const produto = item.produto;

    return {
      produtoId: produto._id,
      nome: produto.nome,
      precoUnitario: produto.preco,
      quantidade: item.quantidade
    };
  });

  const valorTotal = itensPedido.reduce(
    (total, item) => total + item.precoUnitario * item.quantidade,
    0
  );

  const pedido = await Pedido.create({
    usuarioId,
    itens: itensPedido,
    valorTotal,
    status: 'pendente'
  });

  carrinho.itens = [];
  await carrinho.save();

  res.status(201).json(pedido);
});

const atualizarStatusPedido = asyncHandler(async (req, res) => {
  const { pedidoId } = req.params;
  const { status: statusNovo } = req.body;

  const pedido = await Pedido.findById(pedidoId);

  if (!pedido) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  const statusAtual = pedido.status;

  if (!transicaoValida(statusAtual, statusNovo)) {
    throw new AppError(
      `Não é possível mudar o status de "${statusAtual}" para "${statusNovo}".`,
      400
    );
  }

  pedido.status = statusNovo;
  await pedido.save();

  res.status(200).json(pedido);
});

module.exports = { criarPedido, atualizarStatusPedido };