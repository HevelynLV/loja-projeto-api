const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await Usuario.findOne({ email }).select('+senha');

  if (!usuario) {
    throw new AppError('Email ou senha inválidos.', 401);
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    throw new AppError('Email ou senha inválidos.', 401);
  }

  const token = jwt.sign({ usuarioId: usuario._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ token });
});

module.exports = { login };
