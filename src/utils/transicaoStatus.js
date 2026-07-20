const TRANSICOES_VALIDAS = {
  pendente: ['pago', 'cancelado'],
  pago: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: []
};

function transicaoValida(statusAtual, statusNovo) {
  const proximosPermitidos = TRANSICOES_VALIDAS[statusAtual];

  if (!proximosPermitidos) {
    return false;
  }

  return proximosPermitidos.includes(statusNovo);
}

module.exports = { transicaoValida, TRANSICOES_VALIDAS };