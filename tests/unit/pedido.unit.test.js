const { criarPedido } = require('../../src/controllers/pedidoController');
const { atualizarStatusPedido } = require('../../src/controllers/pedidoController');

const Carrinho = require('../../src/models/Carrinho');
const Pedido = require('../../src/models/Pedido');
const AppError = require('../../src/utils/AppError');


jest.mock('../../src/models/Carrinho');
jest.mock('../../src/models/Pedido');

describe('pedidoController - criarPedido', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { usuarioId: 'usuario123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('deve lançar erro 400 se o carrinho não existir', async () => {
    Carrinho.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    await expect(criarPedido(req, res)).rejects.toThrow(AppError);
  });

  it('deve lançar erro 400 se o carrinho existir mas estiver vazio', async () => {
    Carrinho.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({ itens: [] }),
    });

    await expect(criarPedido(req, res)).rejects.toThrow(AppError);
  });

  it('deve criar o pedido com itens desnormalizados, calcular o valorTotal e esvaziar o carrinho', async () => {
    const carrinhoMock = {
      usuario: 'usuario123',
      itens: [
        {
          produto: { _id: 'produto1', nome: 'Camiseta', preco: 50 },
          quantidade: 2,
        },
        {
          produto: { _id: 'produto2', nome: 'Mouse', preco: 100 },
          quantidade: 1,
        },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    Carrinho.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(carrinhoMock),
    });

    const pedidoCriadoMock = { _id: 'pedido123', status: 'pendente' };
    Pedido.create.mockResolvedValue(pedidoCriadoMock);

    await criarPedido(req, res);

    expect(Pedido.create).toHaveBeenCalledWith({
      usuarioId: 'usuario123',
      itens: [
        { produtoId: 'produto1', nome: 'Camiseta', precoUnitario: 50, quantidade: 2 },
        { produtoId: 'produto2', nome: 'Mouse', precoUnitario: 100, quantidade: 1 },
      ],
      valorTotal: 200, // (50*2) + (100*1)
      status: 'pendente',
    });

    expect(carrinhoMock.itens).toEqual([]);
    expect(carrinhoMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(pedidoCriadoMock);
  });
});

describe('pedidoController - atualizarStatusPedido', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { pedidoId: 'pedido123' },
      body: { status: 'pago' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('deve lançar erro 404 se o pedido não existir', async () => {
    Pedido.findById.mockResolvedValue(null);

    await expect(atualizarStatusPedido(req, res)).rejects.toThrow(AppError);
  });

  it('deve lançar erro 400 se a transição não for permitida', async () => {
    const pedidoMock = { status: 'entregue', save: jest.fn() };
    Pedido.findById.mockResolvedValue(pedidoMock);

    await expect(atualizarStatusPedido(req, res)).rejects.toThrow(AppError);
    expect(pedidoMock.save).not.toHaveBeenCalled();
  });

  it('deve atualizar o status e salvar se a transição for válida', async () => {
    const pedidoMock = { status: 'pendente', save: jest.fn().mockResolvedValue(true) };
    Pedido.findById.mockResolvedValue(pedidoMock);

    await atualizarStatusPedido(req, res);

    expect(pedidoMock.status).toBe('pago');
    expect(pedidoMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(pedidoMock);
  });
});