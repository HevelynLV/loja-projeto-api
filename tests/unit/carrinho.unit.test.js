// src/__tests__/unit/carrinho.unit.test.js
const { adicionarItem, verCarrinho, atualizarItem, removerItem, esvaziarCarrinho } = require('../../src/controllers/carrinhoController');

const Carrinho = require('../../src/models/Carrinho');
const Produto = require('../../src/models/Produto');
const AppError = require('../../src/utils/AppError');

jest.mock('../../src/models/Carrinho');
jest.mock('../../src/models/Produto');

describe('carrinhoController - adicionarItem', () => {
  let req, res;

  beforeEach(() => {
    req = {
      usuarioId: 'usuario123',
      body: { produtoId: 'produto123', quantidade: 2 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('deve lançar erro 404 se o produto não existir', async () => {
    Produto.findById.mockResolvedValue(null);

    await expect(adicionarItem(req, res)).rejects.toThrow(AppError);
    expect(Produto.findById).toHaveBeenCalledWith('produto123');
  });

  it('deve criar um novo carrinho se o usuário não tiver um', async () => {
    Produto.findById.mockResolvedValue({ _id: 'produto123', nome: 'Camiseta' });
    Carrinho.findOne.mockResolvedValue(null);

    const carrinhoCriado = {
      usuario: 'usuario123',
      itens: [{ produto: 'produto123', quantidade: 2 }],
      populate: jest.fn().mockResolvedValue({
        usuario: 'usuario123',
        itens: [{ produto: { _id: 'produto123', nome: 'Camiseta' }, quantidade: 2 }],
      }),
    };
    Carrinho.create.mockResolvedValue(carrinhoCriado);

    await adicionarItem(req, res);

    expect(Carrinho.create).toHaveBeenCalledWith({
      usuario: 'usuario123',
      itens: [{ produto: 'produto123', quantidade: 2 }],
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deve somar a quantidade se o produto já estiver no carrinho', async () => {
    Produto.findById.mockResolvedValue({ _id: 'produto123', nome: 'Camiseta' });

    const itemExistente = { produto: { toString: () => 'produto123' }, quantidade: 1 };
    const carrinhoExistente = {
      itens: [itemExistente],
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue({
        itens: [{ ...itemExistente, quantidade: 3 }],
      }),
    };
    Carrinho.findOne.mockResolvedValue(carrinhoExistente);

    await adicionarItem(req, res);

    expect(itemExistente.quantidade).toBe(3); // 1 + 2 da requisição
    expect(carrinhoExistente.save).toHaveBeenCalled();
  });

  it('deve adicionar um novo item se o produto ainda não estiver no carrinho', async () => {
    Produto.findById.mockResolvedValue({ _id: 'produto123', nome: 'Camiseta' });

    const carrinhoExistente = {
      itens: [],
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue({
        itens: [{ produto: 'produto123', quantidade: 2 }],
      }),
    };
    Carrinho.findOne.mockResolvedValue(carrinhoExistente);
    // simula o push real de um array
    carrinhoExistente.itens.push = jest.fn((item) => Array.prototype.push.call(carrinhoExistente.itens, item));

    await adicionarItem(req, res);

    expect(carrinhoExistente.itens.push).toHaveBeenCalledWith({ produto: 'produto123', quantidade: 2 });
    expect(carrinhoExistente.save).toHaveBeenCalled();
  });
});

describe('carrinhoController - verCarrinho', () => {
  let req, res;

  beforeEach(() => {
    req = { usuarioId: 'usuario123' };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('deve lançar erro 404 se o carrinho não existir', async () => {
    Carrinho.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    await expect(verCarrinho(req, res)).rejects.toThrow(AppError);
  });

  it('deve retornar o carrinho populado se ele existir', async () => {
    const carrinhoMock = { usuario: 'usuario123', itens: [] };
    Carrinho.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(carrinhoMock) });

    await verCarrinho(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(carrinhoMock);
  });
});

describe('carrinhoController - atualizarItem', () => {
  let req, res;

  beforeEach(() => {
    req = {
      usuarioId: 'usuario123',
      params: { itemId: 'item123' },
      body: { quantidade: 5 },
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('deve lançar erro 400 se a quantidade for inválida', async () => {
    req.body.quantidade = 0;
    await expect(atualizarItem(req, res)).rejects.toThrow(AppError);
  });

  it('deve lançar erro 404 se o carrinho não existir', async () => {
    Carrinho.findOne.mockResolvedValue(null);
    await expect(atualizarItem(req, res)).rejects.toThrow(AppError);
  });

  it('deve lançar erro 404 se o item não existir no carrinho', async () => {
    Carrinho.findOne.mockResolvedValue({ itens: { id: jest.fn().mockReturnValue(null) } });
    await expect(atualizarItem(req, res)).rejects.toThrow(AppError);
  });

  it('deve atualizar a quantidade do item e salvar', async () => {
    const item = { quantidade: 1 };
    const carrinhoMock = {
      itens: { id: jest.fn().mockReturnValue(item) },
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue({ itens: [item] }),
    };
    Carrinho.findOne.mockResolvedValue(carrinhoMock);

    await atualizarItem(req, res);

    expect(item.quantidade).toBe(5);
    expect(carrinhoMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('carrinhoController - removerItem', () => {
  let req, res;

  beforeEach(() => {
    req = { usuarioId: 'usuario123', params: { itemId: 'item123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('deve lançar erro 404 se o carrinho não existir', async () => {
    Carrinho.findOne.mockResolvedValue(null);
    await expect(removerItem(req, res)).rejects.toThrow(AppError);
  });

  it('deve lançar erro 404 se o item não existir', async () => {
    Carrinho.findOne.mockResolvedValue({ itens: { id: jest.fn().mockReturnValue(null) } });
    await expect(removerItem(req, res)).rejects.toThrow(AppError);
  });

  it('deve remover o item e salvar', async () => {
    const item = { deleteOne: jest.fn() };
    const carrinhoMock = {
      itens: { id: jest.fn().mockReturnValue(item) },
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue({ itens: [] }),
    };
    Carrinho.findOne.mockResolvedValue(carrinhoMock);

    await removerItem(req, res);

    expect(item.deleteOne).toHaveBeenCalled();
    expect(carrinhoMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('carrinhoController - esvaziarCarrinho', () => {
  let req, res;

  beforeEach(() => {
    req = { usuarioId: 'usuario123' };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('deve lançar erro 404 se o carrinho não existir', async () => {
    Carrinho.findOne.mockResolvedValue(null);
    await expect(esvaziarCarrinho(req, res)).rejects.toThrow(AppError);
  });

  it('deve esvaziar os itens e salvar', async () => {
    const carrinhoMock = {
      itens: [{ produto: 'x', quantidade: 1 }],
      save: jest.fn().mockResolvedValue(true),
    };
    Carrinho.findOne.mockResolvedValue(carrinhoMock);

    await esvaziarCarrinho(req, res);

    expect(carrinhoMock.itens).toEqual([]);
    expect(carrinhoMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});