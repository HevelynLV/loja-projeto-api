const { transicaoValida } = require('../../src/utils/transicaoStatus');

describe('transicaoStatus - transicaoValida', () => {
  it('deve permitir pendente -> pago', () => {
    expect(transicaoValida('pendente', 'pago')).toBe(true);
  });

  it('deve permitir pendente -> cancelado', () => {
    expect(transicaoValida('pendente', 'cancelado')).toBe(true);
  });

  it('deve permitir pago -> enviado', () => {
    expect(transicaoValida('pago', 'enviado')).toBe(true);
  });

  it('deve permitir enviado -> entregue', () => {
    expect(transicaoValida('enviado', 'entregue')).toBe(true);
  });

  it('não deve permitir pendente -> enviado (pular etapa)', () => {
    expect(transicaoValida('pendente', 'enviado')).toBe(false);
  });

  it('não deve permitir enviado -> cancelado (já foi despachado)', () => {
    expect(transicaoValida('enviado', 'cancelado')).toBe(false);
  });

  it('não deve permitir transição a partir de entregue (estado final)', () => {
    expect(transicaoValida('entregue', 'pago')).toBe(false);
  });

  it('não deve permitir transição a partir de cancelado (estado final)', () => {
    expect(transicaoValida('cancelado', 'pendente')).toBe(false);
  });

  it('deve retornar false se o status atual for inválido/desconhecido', () => {
    expect(transicaoValida('statusInexistente', 'pago')).toBe(false);
  });
});