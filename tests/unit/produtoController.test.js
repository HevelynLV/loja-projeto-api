const {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto,
} = require('../../src/controllers/produtoController');
const Produto = require('../../src/models/Produto');

jest.mock('../../src/models/Produto');

describe('produtoController - criarProduto', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um produto e retornar status 201', async () => {
    const produtoFake = {
      _id: '507f1f77bcf86cd799439011',
      nome: 'Teclado Mecânico',
      preco: 299.9,
      estoque: 15,
    };

    Produto.create.mockResolvedValue(produtoFake);

    const req = { body: { nome: 'Teclado Mecânico', preco: 299.9, estoque: 15 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await criarProduto(req, res);

    expect(Produto.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(produtoFake);
  });
});

describe('produtoController - listarProdutos', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar todos os produtos e retornar status 200', async () => {
    const produtosFake = [
      { _id: '1', nome: 'Produto A' },
      { _id: '2', nome: 'Produto B' },
    ];

    Produto.find.mockResolvedValue(produtosFake);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await listarProdutos(req, res);

    expect(Produto.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(produtosFake);
  });
});

describe('produtoController - buscarProdutoPorId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o produto quando encontrado', async () => {
    const produtoFake = { _id: '1', nome: 'Produto A' };
    Produto.findById.mockResolvedValue(produtoFake);

    const req = { params: { id: '1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await buscarProdutoPorId(req, res);

    expect(Produto.findById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(produtoFake);
  });

  it('deve lançar erro 404 quando o produto não existir', async () => {
    Produto.findById.mockResolvedValue(null);

    const req = { params: { id: 'idInexistente' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await buscarProdutoPorId(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Produto não encontrado', statusCode: 404 })
    );
  });
});

describe('produtoController - atualizarProduto', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve atualizar o produto e retornar status 200', async () => {
    const produtoAtualizado = { _id: '1', nome: 'Produto A', preco: 199.9 };
    Produto.findByIdAndUpdate.mockResolvedValue(produtoAtualizado);

    const req = { params: { id: '1' }, body: { preco: 199.9 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await atualizarProduto(req, res);

    expect(Produto.findByIdAndUpdate).toHaveBeenCalledWith('1', req.body, {
      new: true,
      runValidators: true,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(produtoAtualizado);
  });

  it('deve lançar erro 404 quando o produto não existir', async () => {
    Produto.findByIdAndUpdate.mockResolvedValue(null);

    const req = { params: { id: 'idInexistente' }, body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await atualizarProduto(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Produto não encontrado', statusCode: 404 })
    );
  });
});

describe('produtoController - deletarProduto', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve deletar o produto e retornar status 200', async () => {
    const produtoFake = { _id: '1', nome: 'Produto A' };
    Produto.findByIdAndDelete.mockResolvedValue(produtoFake);

    const req = { params: { id: '1' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deletarProduto(req, res);

    expect(Produto.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Produto removido com sucesso' });
  });

  it('deve lançar erro 404 quando o produto não existir', async () => {
    Produto.findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { id: 'idInexistente' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await deletarProduto(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Produto não encontrado', statusCode: 404 })
    );
  });
});