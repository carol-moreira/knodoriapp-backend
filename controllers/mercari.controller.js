const prisma = require('../prisma');

// modelo prisma: mercariRequest
const listar_mercari = async (req, res) => {
  try {
    const registros = await prisma.mercariRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'ok', data: registros });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ status: 'erro', message: 'erro ao buscar os pedidos mercari.' });
  }
};

const criar_mercari = async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
    return res.status(400).json({ status: 'erro', message: 'corpo da requisição vazio.' });
  }

  try {
    const novo_registro = await prisma.mercariRequest.create({
      data: req.body
    });
    res.status(201).json({ status: 'ok', data: novo_registro });
  } catch (erro) {
    console.error(erro);
    // erros de validação do prisma (campo ausente/tipo inválido) ou de fk viram 400
    if (erro.name === 'PrismaClientValidationError' || erro.code === 'P2003') {
      return res.status(400).json({ status: 'erro', message: 'dados inválidos para o pedido mercari.' });
    }
    res.status(500).json({ status: 'erro', message: 'erro ao registrar o pedido mercari.' });
  }
};

module.exports = { listar_mercari, criar_mercari };
