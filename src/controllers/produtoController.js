const Produto = require('../models/Produto');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const criarProduto = asyncHandler(async (req, res) => {
  const produto = await Produto.create(req.body);
  res.status(201).json(produto);
});

const listarProdutos = asyncHandler(async (req, res) => {
  const produtos = await Produto.find();
  res.status(200).json(produtos);
});

const buscarProdutoPorId = asyncHandler(async (req, res) => {
  const produto = await Produto.findById(req.params.id);
  if (!produto) {
    throw new AppError('Produto não encontrado', 404);
  }
  res.status(200).json(produto);
});

const atualizarProduto = asyncHandler(async (req, res) => {
  const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!produto) {
    throw new AppError('Produto não encontrado', 404);
  }
  res.status(200).json(produto);
});

const deletarProduto = asyncHandler(async (req, res) => {
  const produto = await Produto.findByIdAndDelete(req.params.id);
  if (!produto) {
    throw new AppError('Produto não encontrado', 404);
  }
  res.status(200).json({ mensagem: 'Produto removido com sucesso' });
});

module.exports = {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto,
};