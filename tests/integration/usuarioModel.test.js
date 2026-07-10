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

describe('Usuario - hash de senha', () => {
  it('não deve gerar um novo hash quando a senha não for modificada', async () => {
    const usuario = await Usuario.create({
      nome: 'Ana',
      email: 'ana@email.com',
      senha: '123456',
    });

    const usuarioComSenha = await Usuario.findById(usuario._id).select('+senha');
    const hashOriginal = usuarioComSenha.senha;

    usuarioComSenha.nome = 'Ana Paula';
    await usuarioComSenha.save();

    const usuarioAtualizado = await Usuario.findById(usuario._id).select('+senha');
    expect(usuarioAtualizado.senha).toBe(hashOriginal);
  });
});