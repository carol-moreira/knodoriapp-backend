const prisma = require('../prisma');

// modelo prisma: cegGeral
const listar_ceg = async (req, res) => {
  try {
    const registros = await prisma.cegGeral.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ status: 'ok', data: registros });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ status: 'erro', message: 'erro ao buscar as cegs.' });
  }
};

const criar_ceg = async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
    return res.status(400).json({ status: 'erro', message: 'corpo da requisição vazio.' });
  }

  try {
    const novo_registro = await prisma.cegGeral.create({
      data: req.body
    });
    res.status(201).json({ status: 'ok', data: novo_registro });
  } catch (erro) {
    console.error(erro);
    // erros de validação do prisma (campo ausente/tipo inválido) ou de fk viram 400
    if (erro.name === 'PrismaClientValidationError' || erro.code === 'P2003') {
      return res.status(400).json({ status: 'erro', message: 'dados inválidos para a ceg.' });
    }
    res.status(500).json({ status: 'erro', message: 'erro ao registrar a ceg.' });
  }
};

module.exports = { listar_ceg, criar_ceg };
