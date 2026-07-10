const {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
} = require('../../src/controllers/usuarioController');
const Usuario = require('../../src/models/Usuario');

jest.mock('../../src/models/Usuario');

describe('usuarioController - criarUsuario', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um usuário e não retornar a senha', async () => {
    const usuarioFake = {
      toObject: () => ({
        _id: '1',
        nome: 'Maria Silva',
        email: 'maria@email.com',
        senha: 'hashfake123',
      }),
    };

    Usuario.create.mockResolvedValue(usuarioFake);

    const req = {
      body: { nome: 'Maria Silva', email: 'maria@email.com', senha: '123456' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await criarUsuario(req, res);

    expect(Usuario.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      _id: '1',
      nome: 'Maria Silva',
      email: 'maria@email.com',
    });
  });
});

describe('usuarioController - listarUsuarios', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar todos os usuários e retornar status 200', async () => {
    const usuariosFake = [{ _id: '1', nome: 'Usuario A' }];
    Usuario.find.mockResolvedValue(usuariosFake);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await listarUsuarios(req, res);

    expect(Usuario.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(usuariosFake);
  });
});

describe('usuarioController - buscarUsuarioPorId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o usuário quando encontrado', async () => {
    const usuarioFake = { _id: '1', nome: 'Usuario A' };
    Usuario.findById.mockResolvedValue(usuarioFake);

    const req = { params: { id: '1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await buscarUsuarioPorId(req, res);

    expect(Usuario.findById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(usuarioFake);
  });

  it('deve lançar erro 404 quando o usuário não existir', async () => {
    Usuario.findById.mockResolvedValue(null);

    const req = { params: { id: 'idInexistente' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await buscarUsuarioPorId(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Usuário não encontrado', statusCode: 404 })
    );
  });
});

describe('usuarioController - atualizarUsuario', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve atualizar o usuário e retornar status 200', async () => {
    const usuarioAtualizado = { _id: '1', nome: 'Nome Novo' };
    Usuario.findByIdAndUpdate.mockResolvedValue(usuarioAtualizado);

    const req = { params: { id: '1' }, body: { nome: 'Nome Novo' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await atualizarUsuario(req, res);

    expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith('1', req.body, {
      new: true,
      runValidators: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(usuarioAtualizado);
  });

  it('deve lançar erro 404 quando o usuário não existir', async () => {
    Usuario.findByIdAndUpdate.mockResolvedValue(null);

    const req = { params: { id: 'idInexistente' }, body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await atualizarUsuario(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Usuário não encontrado', statusCode: 404 })
    );
  });
});

describe('usuarioController - deletarUsuario', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve deletar o usuário e retornar status 200', async () => {
    const usuarioFake = { _id: '1', nome: 'Usuario A' };
    Usuario.findByIdAndDelete.mockResolvedValue(usuarioFake);

    const req = { params: { id: '1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deletarUsuario(req, res);

    expect(Usuario.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário removido com sucesso' });
  });

  it('deve lançar erro 404 quando o usuário não existir', async () => {
    Usuario.findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { id: 'idInexistente' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await deletarUsuario(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Usuário não encontrado', statusCode: 404 })
    );
  });
});