const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Carrinho = require('../models/Carrinho');
const Produto = require('../models/Produto');

const adicionarItem = asyncHandler(async (req, res) => {
  const { usuarioId } = req.params;
  const { produtoId, quantidade } = req.body;

  // 1. Verifica se o Produto existe de verdade
  const produto = await Produto.findById(produtoId);
  if (!produto) {
    throw new AppError('Produto não encontrado.', 404);
  }

  // 2. Busca o carrinho do usuário
  let carrinho = await Carrinho.findOne({ usuario: usuarioId });

  // 3. Se não existe carrinho, cria um novo já com o item
  if (!carrinho) {
    carrinho = await Carrinho.create({
      usuario: usuarioId,
      itens: [{ produto: produtoId, quantidade }],
    });
  } else {
    // 4. Se existe, verifica se o produto já está no array de itens
    const itemExistente = carrinho.itens.find(
      (item) => item.produto.toString() === produtoId
    );

    if (itemExistente) {
      // 4a. Já existe -> soma a quantidade
      itemExistente.quantidade += quantidade;
    } else {
      // 4b. Não existe -> adiciona novo item
      carrinho.itens.push({ produto: produtoId, quantidade });
    }

    await carrinho.save();
  }

  // 5. Retorna o carrinho com os dados completos do produto
  const carrinhoPopulado = await carrinho.populate('itens.produto');

  return res.status(200).json(carrinhoPopulado);
});



const verCarrinho = asyncHandler(async (req, res) => {
  const { usuarioId } = req.params;

  const carrinho = await Carrinho.findOne({ usuario: usuarioId }).populate('itens.produto');

  if (!carrinho) {
    throw new AppError('Carrinho não encontrado para este usuário.', 404);
  }

  return res.status(200).json(carrinho);
});


const atualizarItem = asyncHandler(async (req, res) => {
  const { usuarioId, itemId } = req.params;
  const { quantidade } = req.body;

  if (!quantidade || quantidade < 1) {
    throw new AppError('A quantidade deve ser no mínimo 1.', 400);
  }

  const carrinho = await Carrinho.findOne({ usuario: usuarioId });

  if (!carrinho) {
    throw new AppError('Carrinho não encontrado para este usuário.', 404);
  }

  // .id() é um método especial do Mongoose pra buscar um subdocumento pelo seu _id
  const item = carrinho.itens.id(itemId);

  if (!item) {
    throw new AppError('Item não encontrado no carrinho.', 404);
  }

  item.quantidade = quantidade;
  await carrinho.save();

  const carrinhoPopulado = await carrinho.populate('itens.produto');

  return res.status(200).json(carrinhoPopulado);
});

const removerItem = asyncHandler(async (req, res) => {
  const { usuarioId, itemId } = req.params;

  const carrinho = await Carrinho.findOne({ usuario: usuarioId });

  if (!carrinho) {
    throw new AppError('Carrinho não encontrado para este usuário.', 404);
  }

  const item = carrinho.itens.id(itemId);

  if (!item) {
    throw new AppError('Item não encontrado no carrinho.', 404);
  }

  // .deleteOne() no subdocumento remove ele do array
  item.deleteOne();
  await carrinho.save();

  const carrinhoPopulado = await carrinho.populate('itens.produto');

  return res.status(200).json(carrinhoPopulado);
});

const esvaziarCarrinho = asyncHandler(async (req, res) => {
  const { usuarioId } = req.params;

  const carrinho = await Carrinho.findOne({ usuario: usuarioId });

  if (!carrinho) {
    throw new AppError('Carrinho não encontrado para este usuário.', 404);
  }

  carrinho.itens = [];
  await carrinho.save();

  return res.status(200).json(carrinho);
});

module.exports = { 
    adicionarItem, 
    verCarrinho, 
    atualizarItem, 
    removerItem, 
    esvaziarCarrinho 
};