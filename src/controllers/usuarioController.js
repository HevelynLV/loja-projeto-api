const Usuario = require('../models/Usuario');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const criarUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.create(req.body);
  const usuarioSemSenha = usuario.toObject();
  delete usuarioSemSenha.senha;
  res.status(201).json(usuarioSemSenha);
});

const listarUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.find();
  res.status(200).json(usuarios);
});

const buscarUsuarioPorId = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }
  res.status(200).json(usuario);
});

const atualizarUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }
  res.status(200).json(usuario);
});

const deletarUsuario = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }
  res.status(200).json({ mensagem: 'Usuário removido com sucesso' });
});

module.exports = {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
};