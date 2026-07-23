const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Produto = require('../../src/models/Produto');
const Usuario = require('../../src/models/Usuario');
const Carrinho = require('../../src/models/Carrinho');
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

// Helper: cria um usuário e um produto reais no banco de teste,
// e já gera o token JWT desse usuário pra reaproveitar nos vários describes abaixo
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

describe('POST /carrinho/itens', () => {
  it('deve criar um carrinho novo ao adicionar o primeiro item', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    const resposta = await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.itens).toHaveLength(1);
    expect(resposta.body.itens[0].produto._id).toBe(produto._id.toString());
    expect(resposta.body.itens[0].quantidade).toBe(2);
  });

  it('deve somar a quantidade se o produto já estiver no carrinho', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    const resposta = await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 3 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.itens).toHaveLength(1);
    expect(resposta.body.itens[0].quantidade).toBe(5);
  });

  it('deve retornar 404 se o produto não existir', async () => {
    const { token } = await criarUsuarioEProduto();
    const idFake = '000000000000000000000000';

    const resposta = await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: idFake, quantidade: 1 });

    expect(resposta.status).toBe(404);
  });

  it('deve retornar 401 se não enviar token', async () => {
    const { produto } = await criarUsuarioEProduto();

    const resposta = await request(app)
      .post('/carrinho/itens')
      .send({ produtoId: produto._id, quantidade: 1 });

    expect(resposta.status).toBe(401);
  });
});

describe('GET /carrinho', () => {
  it('deve retornar o carrinho populado do usuário', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    const resposta = await request(app)
      .get('/carrinho')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.itens[0].produto.nome).toBe('Produto Teste');
  });

  it('deve retornar 404 se o usuário não tiver carrinho', async () => {
    const { token } = await criarUsuarioEProduto();

    const resposta = await request(app)
      .get('/carrinho')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(404);
  });
});

describe('PUT /carrinho/itens/:itemId', () => {
  it('deve atualizar a quantidade de um item existente', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    const carrinhoInicial = await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    const itemId = carrinhoInicial.body.itens[0]._id;

    const resposta = await request(app)
      .put(`/carrinho/itens/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantidade: 7 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.itens[0].quantidade).toBe(7);
  });

  it('deve retornar 400 se a quantidade for inválida', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    const carrinhoInicial = await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    const itemId = carrinhoInicial.body.itens[0]._id;

    const resposta = await request(app)
      .put(`/carrinho/itens/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantidade: 0 });

    expect(resposta.status).toBe(400);
  });

  it('deve retornar 404 se o item não existir no carrinho', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    const idFake = '000000000000000000000000';

    const resposta = await request(app)
      .put(`/carrinho/itens/${idFake}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantidade: 3 });

    expect(resposta.status).toBe(404);
  });
});

describe('DELETE /carrinho/itens/:itemId', () => {
  it('deve remover um item específico do carrinho', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    const carrinhoInicial = await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    const itemId = carrinhoInicial.body.itens[0]._id;

    const resposta = await request(app)
      .delete(`/carrinho/itens/${itemId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.itens).toHaveLength(0);
  });

  it('deve retornar 404 se o item não existir', async () => {
    const { produto, token } = await criarUsuarioEProduto();

    await request(app)
      .post('/carrinho/itens')
      .set('Authorization', `Bearer ${token}`)
      .send({ produtoId: produto._id, quantidade: 2 });

    const idFake = '000000000000000000000000';

    const resposta = await request(app)
      .delete(`/carrinho/itens/${idFake}`)
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(404);
  });
});
