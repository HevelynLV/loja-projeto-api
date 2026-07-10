const express = require('express');
const router = express.Router();

const {
  adicionarItem,
  verCarrinho,
  atualizarItem,
  removerItem,
  esvaziarCarrinho,
} = require('../controllers/carrinhoController');

router.post('/:usuarioId/itens', adicionarItem);
router.get('/:usuarioId', verCarrinho);
router.put('/:usuarioId/itens/:itemId', atualizarItem);
router.delete('/:usuarioId/itens/:itemId', removerItem);
router.delete('/:usuarioId', esvaziarCarrinho);

module.exports = router;