const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `ID inválido: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const campo = Object.keys(err.keyValue)[0];
    message = `O valor '${err.keyValue[campo]}' já está em uso no campo '${campo}'`;
  }

  console.error(err);

  res.status(statusCode).json({ erro: message });
};

module.exports = errorHandler;