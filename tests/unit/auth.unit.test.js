const jwt = require('jsonwebtoken');
const auth = require('../../src/middlewares/auth');
const AppError = require('../../src/utils/AppError');

describe('auth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it('deve chamar next com AppError 401 quando o header Authorization estiver ausente', () => {
    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('deve chamar next com AppError 401 quando o token for inválido', () => {
    req.headers.authorization = 'Bearer token-invalido';

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('deve chamar next com AppError 401 quando o token estiver expirado', () => {
    const tokenExpirado = jwt.sign({ usuarioId: 'usuario123' }, process.env.JWT_SECRET, {
      expiresIn: -10,
    });
    req.headers.authorization = `Bearer ${tokenExpirado}`;

    auth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('deve anexar usuarioId em req e chamar next sem erro quando o token for válido', () => {
    const token = jwt.sign({ usuarioId: 'usuario123' }, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;

    auth(req, res, next);

    expect(req.usuarioId).toBe('usuario123');
    expect(next).toHaveBeenCalledWith();
  });
});
