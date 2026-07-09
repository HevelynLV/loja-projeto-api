const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const conectarBancoTeste = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

const desconectarBancoTeste = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

const limparBancoTeste = async () => {
  const colecoes = mongoose.connection.collections;
  for (const chave in colecoes) {
    await colecoes[chave].deleteMany();
  }
};

module.exports = { conectarBancoTeste, desconectarBancoTeste, limparBancoTeste };