const express = require('express');
const router = express.Router();

const { criarPedido, atualizarStatusPedido } = require('../controllers/pedidoController');
const auth = require('../middlewares/auth');

router.use(auth);

router.post('/', criarPedido);
router.put('/:pedidoId/status', atualizarStatusPedido);

module.exports = router;