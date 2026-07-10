const request = require('supertest');
const app = require('../../src/app');
const Usuario = require('../../src/models/Usuario');
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

describe('POST /usuarios', () => {
  it('deve criar um usuário, aplicar hash na senha e não retornar a senha', async () => {
    const novoUsuario = {
      nome: 'João Pedro',
      email: 'joao@email.com',
      senha: '123456',
    };

    const resposta = await request(app).post('/usuarios').send(novoUsuario);

    expect(resposta.status).toBe(201);
    expect(resposta.body.nome).toBe(novoUsuario.nome);
    expect(resposta.body.senha).toBeUndefined();

    const usuarioNoBanco = await Usuario.findOne({ email: 'joao@email.com' }).select('+senha');
    expect(usuarioNoBanco.senha).not.toBe('123456');
  });

  it('deve retornar 409 ao tentar criar usuário com email duplicado', async () => {
    await Usuario.create({ nome: 'Primeiro', email: 'duplicado@email.com', senha: '123456' });

    const resposta = await request(app).post('/usuarios').send({
      nome: 'Segundo',
      email: 'duplicado@email.com',
      senha: '654321',
    });

    expect(resposta.status).toBe(409);
  });

  it('deve retornar 400 se faltar campo obrigatório', async () => {
    const resposta = await request(app).post('/usuarios').send({ nome: 'Sem email nem senha' });

    expect(resposta.status).toBe(400);
  });
});

describe('GET /usuarios', () => {
  it('deve listar usuários sem expor a senha', async () => {
    await Usuario.create({ nome: 'Usuario 1', email: 'u1@email.com', senha: '123456' });

    const resposta = await request(app).get('/usuarios');

    expect(resposta.status).toBe(200);
    expect(resposta.body[0].senha).toBeUndefined();
  });
});

describe('GET /usuarios/:id', () => {
  it('deve retornar um usuário existente', async () => {
    const usuario = await Usuario.create({
      nome: 'Usuario X',
      email: 'x@email.com',
      senha: '123456',
    });

    const resposta = await request(app).get(`/usuarios/${usuario._id}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.email).toBe('x@email.com');
  });

  it('deve retornar 404 se o usuário não existir', async () => {
    const idFake = '000000000000000000000000';

    const resposta = await request(app).get(`/usuarios/${idFake}`);

    expect(resposta.status).toBe(404);
  });
});

describe('PUT /usuarios/:id', () => {
  it('deve atualizar um usuário existente', async () => {
    const usuario = await Usuario.create({
      nome: 'Nome Antigo',
      email: 'antigo@email.com',
      senha: '123456',
    });

    const resposta = await request(app)
      .put(`/usuarios/${usuario._id}`)
      .send({ nome: 'Nome Atualizado' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.nome).toBe('Nome Atualizado');
  });

  it('deve retornar 404 se o usuário não existir', async () => {
    const idFake = '000000000000000000000000';

    const resposta = await request(app).put(`/usuarios/${idFake}`).send({ nome: 'Teste' });

    expect(resposta.status).toBe(404);
  });
});

describe('DELETE /usuarios/:id', () => {
  it('deve deletar um usuário existente', async () => {
    const usuario = await Usuario.create({
      nome: 'Para Deletar',
      email: 'deletar@email.com',
      senha: '123456',
    });

    const resposta = await request(app).delete(`/usuarios/${usuario._id}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.mensagem).toBe('Usuário removido com sucesso');
  });

  it('deve retornar 404 se o usuário não existir', async () => {
    const idFake = '000000000000000000000000';

    const resposta = await request(app).delete(`/usuarios/${idFake}`);

    expect(resposta.status).toBe(404);
  });
});