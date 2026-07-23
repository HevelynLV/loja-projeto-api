const request = require('supertest');
const jwt = require('jsonwebtoken');
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

  const token = jwt.sign({ usuarioId: usuario._id }, process.env.JWT_SECRET);

  return { usuario, produto, token };
};

describe('POST /pedidos', () => {
  it('deve criar um pedido a partir do carrinho, desnormalizando os dados do produto', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    const resposta = await request(app)
      .post('/pedidos')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(201);
    expect(resposta.body.itens).toHaveLength(1);
    expect(resposta.body.itens[0].nome).toBe('Produto Teste');
    expect(resposta.body.itens[0].precoUnitario).toBe(50);
    expect(resposta.body.itens[0].quantidade).toBe(2);
    expect(resposta.body.valorTotal).toBe(100);
    expect(resposta.body.status).toBe('pendente');
  });

  it('deve esvaziar o carrinho depois de criar o pedido', async () => {
    const { usuario, produto, token } = await criarUsuarioEProduto();

    await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    await request(app).post('/pedidos').set('Authorization', `Bearer ${token}`);

    const carrinho = await Carrinho.findOne({ usuario: usuario._id });

    expect(carrinho.itens).toHaveLength(0);
  });

  it('deve retornar 400 se o carrinho não existir', async () => {
    const { token } = await criarUsuarioEProduto();

    const resposta = await request(app)
      .post('/pedidos')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(400);
  });

  it('deve retornar 401 se não enviar token', async () => {
    const resposta = await request(app).post('/pedidos');

    expect(resposta.status).toBe(401);
  });

  it('deve manter o pedido íntegro mesmo se o preço do produto mudar depois', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 1 });

    const respostaPedido = await request(app)
      .post('/pedidos')
      .set('Authorization', `Bearer ${token}`);

    produto.preco = 999;
    await produto.save();

    const pedidoSalvo = await Pedido.findById(respostaPedido.body._id);

    expect(pedidoSalvo.itens[0].precoUnitario).toBe(50);
  });
});

describe('PUT /pedidos/:pedidoId/status', () => {
  it('deve atualizar o status quando a transição for válida (pendente -> pago)', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 1 });

    const respostaPedido = await request(app)
      .post('/pedidos')
      .set('Authorization', `Bearer ${token}`);

    const resposta = await request(app)
      .put(`/pedidos/${respostaPedido.body._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'pago' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('pago');
  });

  it('deve retornar 400 quando a transição for inválida (pendente -> enviado)', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 1 });

    const respostaPedido = await request(app)
      .post('/pedidos')
      .set('Authorization', `Bearer ${token}`);

    const resposta = await request(app)
      .put(`/pedidos/${respostaPedido.body._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'enviado' });

    expect(resposta.status).toBe(400);
  });

  it('deve retornar 404 se o pedido não existir', async () => {
    const { token } = await criarUsuarioEProduto();
    const idFake = '000000000000000000000000';

    const resposta = await request(app)
      .put(`/pedidos/${idFake}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'pago' });

    expect(resposta.status).toBe(404);
  });

  it('deve retornar 401 se não enviar token', async () => {
    const idFake = '000000000000000000000000';

    const resposta = await request(app)
      .put(`/pedidos/${idFake}/status`)
      .send({ status: 'pago' });

    expect(resposta.status).toBe(401);
  });
});
