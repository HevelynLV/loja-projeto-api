const express = require('express');
const router = express.Router();

const {
  adicionarItem,
  verCarrinho,
  atualizarItem,
  removerItem,
  esvaziarCarrinho,
} = require('../controllers/carrinhoController');
const auth = require('../middlewares/auth');

router.use(auth);

router.post('/itens', adicionarItem);
router.get('/', verCarrinho);
router.put('/itens/:itemId', atualizarItem);
router.delete('/itens/:itemId', removerItem);
router.delete('/', esvaziarCarrinho);

module.exports = router;