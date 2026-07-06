// Agora o middleware que captura esses erros e monta a resposta HTTP.

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  console.error(err);

  res.status(statusCode).json({ erro: message });
};

module.exports = errorHandler;