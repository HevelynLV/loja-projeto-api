const express = require('express');
const router = express.Router();

const { criarPedido, atualizarStatusPedido } = require('../controllers/pedidoController');

router.post('/:usuarioId', criarPedido);
router.put('/:pedidoId/status', atualizarStatusPedido);

module.exports = router;