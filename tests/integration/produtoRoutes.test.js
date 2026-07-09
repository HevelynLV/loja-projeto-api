const request = require('supertest');
const app = require('../../src/app');
const Produto = require('../../src/models/Produto');
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

describe('GET /', () => {
  it('deve retornar a mensagem de boas-vindas da API', async () => {
    const resposta = await request(app).get('/');

    expect(resposta.status).toBe(200);
    expect(resposta.body.message).toBe('API da Loja está no ar!');
  });
});

describe('POST /produtos', () => {
  it('deve criar um produto e retornar status 201', async () => {
    const novoProduto = {
      nome: 'Monitor 24"',
      descricao: 'Full HD, 75Hz',
      preco: 899.9,
      estoque: 8,
      categoria: 'Eletrônicos',
    };

    const resposta = await request(app).post('/produtos').send(novoProduto);

    expect(resposta.status).toBe(201);
    expect(resposta.body.nome).toBe(novoProduto.nome);
    expect(resposta.body._id).toBeDefined();
  });

  it('deve retornar 400 se faltar campo obrigatório', async () => {
    const produtoInvalido = { descricao: 'Sem nome nem preço' };

    const resposta = await request(app).post('/produtos').send(produtoInvalido);

    expect(resposta.status).toBe(400);
  });
});

describe('GET /produtos', () => {
  it('deve listar os produtos existentes', async () => {
    await Produto.create({ nome: 'Produto Teste 1', preco: 10, estoque: 5 });
    await Produto.create({ nome: 'Produto Teste 2', preco: 20, estoque: 3 });

    const resposta = await request(app).get('/produtos');

    expect(resposta.status).toBe(200);
    expect(resposta.body.length).toBe(2);
  });
});
describe('GET /produtos/:id', () => {
  it('deve retornar um produto existente', async () => {
    const produto = await Produto.create({ nome: 'Produto X', preco: 50, estoque: 4 });

    const resposta = await request(app).get(`/produtos/${produto._id}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.nome).toBe('Produto X');
  });

  it('deve retornar 404 se o produto não existir', async () => {
    const idFake = '000000000000000000000000';

    const resposta = await request(app).get(`/produtos/${idFake}`);

    expect(resposta.status).toBe(404);
  });

  it('deve retornar 400 se o ID for inválido', async () => {
    const resposta = await request(app).get('/produtos/id-invalido');

    expect(resposta.status).toBe(400);
  });
});

describe('PUT /produtos/:id', () => {
  it('deve atualizar um produto existente', async () => {
    const produto = await Produto.create({ nome: 'Produto Y', preco: 100, estoque: 2 });

    const resposta = await request(app)
      .put(`/produtos/${produto._id}`)
      .send({ preco: 80 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.preco).toBe(80);
  });

  it('deve retornar 404 se o produto não existir', async () => {
    const idFake = '000000000000000000000000';

    const resposta = await request(app).put(`/produtos/${idFake}`).send({ preco: 10 });

    expect(resposta.status).toBe(404);
  });
});

describe('DELETE /produtos/:id', () => {
  it('deve deletar um produto existente', async () => {
    const produto = await Produto.create({ nome: 'Produto Z', preco: 30, estoque: 1 });

    const resposta = await request(app).delete(`/produtos/${produto._id}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.mensagem).toBe('Produto removido com sucesso');
  });

  it('deve retornar 404 se o produto não existir', async () => {
    const idFake = '000000000000000000000000';

    const resposta = await request(app).delete(`/produtos/${idFake}`);

    expect(resposta.status).toBe(404);
  });
});