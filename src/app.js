const express = require('express');
const produtoRoutes = require('./routes/produtoRoutes');

const app = express();


// Middleware que permite o Express entender JSON no corpo das requisições
app.use(express.json());

// Rota de teste simples
app.get('/', (req, res) => {
  res.json({ message: 'API da Loja está no ar!' });
});

app.use('/produtos', produtoRoutes);
module.exports = app;