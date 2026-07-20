const request = require('supertest');
const app = require('../../src/app');
const Produto = require('../../src/models/Produto');
const Usuario = require('../../src/models/Usuario');
const Carrinho = require('../../src/models/Carrinho');
const Pedido = require('../../src/models/Pedido');
const { conectarBancoTeste, desconectarBancoTeste, limparBancoTeste } = require('../setup');

beforeAll(async () => {
  await conectarBancoTeste();
});

afterAll(async () => {
  await desconectarBancoTeste();
});

afterEach(async () => {
  await limparBancoTeste();
});

const criarUsuarioEProduto = async () => {
  const usuario = await Usuario.create({
    nome: 'Usuário Teste',
    email: `teste${Date.now()}@example.com`,
    senha: '123456',
  });

  const produto = await Produto.create({
    nome: 'Produto Teste',
    preco: 50,
    estoque: 10,
  });

  return { usuario, produto };
};

describe('POST /pedidos/:usuarioId', () => {
  it('deve criar um pedido a partir do carrinho, desnormalizando os dados do produto', async () => {
    const { usuario, produto } = await criarUsuarioEProduto();

    await request(app)
      .post(`/carrinho/${usuario._id}/itens`)
      .send({ produtoId: produto._id, quantidade: 2 });

    const resposta = await request(app).post(`/pedidos/${usuario._id}`);

    expect(resposta.status).toBe(201);
    expect(resposta.body.itens).toHaveLength(1);
    expect(resposta.body.itens[0].nome).toBe('Produto Teste');
    expect(resposta.body.itens[0].precoUnitario).toBe(50);
    expect(resposta.body.itens[0].quantidade).toBe(2);
    expect(resposta.body.valorTotal).toBe(100);
    expect(resposta.body.status).toBe('pendente');
  });

  it('deve esvaziar o carrinho depois de criar o pedido', async () => {
    const { usuario, produto } = await criarUsuarioEProduto();

    await request(app)
      .post(`/carrinho/${usuario._id}/itens`)
      .send({ produtoId: produto._id, quantidade: 2 });

    await request(app).post(`/pedidos/${usuario._id}`);

    const carrinho = await Carrinho.findOne({ usuario: usuario._id });

    expect(carrinho.itens).toHaveLength(0);
  });

  it('deve retornar 400 se o carrinho não existir', async () => {
    const { usuario } = await criarUsuarioEProduto();

    const resposta = await request(app).post(`/pedidos/${usuario._id}`);

    expect(resposta.status).toBe(400);
  });

  it('deve manter o pedido íntegro mesmo se o preço do produto mudar depois', async () => {
    const { usuario, produto } = await criarUsuarioEProduto();

    await request(app)
      .post(`/carrinho/${usuario._id}/itens`)
      .send({ produtoId: produto._id, quantidade: 1 });

    const respostaPedido = await request(app).post(`/pedidos/${usuario._id}`);

    produto.preco = 999;
    await produto.save();

    const pedidoSalvo = await Pedido.findById(respostaPedido.body._id);

    expect(pedidoSalvo.itens[0].precoUnitario).toBe(50);
  });
});

describe('PUT /pedidos/:pedidoId/status', () => {
  it('deve atualizar o status quando a transição for válida (pendente -> pago)', async () => {
    const { usuario, produto } = await criarUsuarioEProduto();

    await request(app)
      .post(`/carrinho/${usuario._id}/itens`)
      .send({ produtoId: produto._id, quantidade: 1 });

    const respostaPedido = await request(app).post(`/pedidos/${usuario._id}`);

    const resposta = await request(app)
      .put(`/pedidos/${respostaPedido.body._id}/status`)
      .send({ status: 'pago' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('pago');
  });

  it('deve retornar 400 quando a transição for inválida (pendente -> enviado)', async () => {
    const { usuario, produto } = await criarUsuarioEProduto();

    await request(app)
      .post(`/carrinho/${usuario._id}/itens`)
      .send({ produtoId: produto._id, quantidade: 1 });

    const respostaPedido = await request(app).post(`/pedidos/${usuario._id}`);

    const resposta = await request(app)
      .put(`/pedidos/${respostaPedido.body._id}/status`)
      .send({ status: 'enviado' });

    expect(resposta.status).toBe(400);
  });

  it('deve retornar 404 se o pedido não existir', async () => {
    const idFake = '000000000000000000000000';

    const resposta = await request(app)
      .put(`/pedidos/${idFake}/status`)
      .send({ status: 'pago' });

    expect(resposta.status).toBe(404);
  });
});