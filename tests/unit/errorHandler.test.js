const errorHandler = require('../../src/middlewares/errorHandler');

describe('errorHandler', () => {
  let res;
  let consoleErrorSpy;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('deve usar mensagem padrão quando o erro não tem message', () => {
    const erroSemMensagem = {};

    errorHandler(erroSemMensagem, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno do servidor' });
  });
});