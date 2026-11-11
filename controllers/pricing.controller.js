const { validar_entrada, calcular_preco } = require('../lib/pricing.engine');

const calcular = async (req, res) => {
  const validacao = validar_entrada(req.body);
  if (!validacao.ok) {
    return res.status(400).json({ message: validacao.message });
  }

  try {
    res.json(await calcular_preco(validacao.data));
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ message: 'erro interno no servidor.' });
  }
};

module.exports = { calcular };
