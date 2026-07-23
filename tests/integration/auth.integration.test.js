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

describe('POST /login', () => {
  it('deve retornar um token quando as credenciais forem válidas', async () => {
    await Usuario.create({
      nome: 'Usuário Teste',
      email: 'usuario@example.com',
      senha: '123456',
    });

    const resposta = await request(app)
      .post('/login')
      .send({ email: 'usuario@example.com', senha: '123456' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.token).toEqual(expect.any(String));
  });

  it('deve retornar 401 quando a senha estiver errada', async () => {
    await Usuario.create({
      nome: 'Usuário Teste',
      email: 'usuario@example.com',
      senha: '123456',
    });

    const resposta = await request(app)
      .post('/login')
      .send({ email: 'usuario@example.com', senha: 'senha-errada' });

    expect(resposta.status).toBe(401);
  });

  it('deve retornar 401 quando o email não existir', async () => {
    const resposta = await request(app)
      .post('/login')
      .send({ email: 'inexistente@example.com', senha: '123456' });

    expect(resposta.status).toBe(401);
  });
});
