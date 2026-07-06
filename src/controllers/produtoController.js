const Produto = require('../models/Produto');

// Criar um novo produto
const criarProduto = async (req, res) => {
  try {
    const produto = await Produto.create(req.body);
    res.status(201).json(produto);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

// Listar todos os produtos
const listarProdutos = async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.status(200).json(produtos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Buscar um produto específico pelo ID
const buscarProdutoPorId = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.status(200).json(produto);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Atualizar um produto existente
const atualizarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.status(200).json(produto);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

// Deletar um produto
const deletarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);
    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    res.status(200).json({ mensagem: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

module.exports = {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto,
};