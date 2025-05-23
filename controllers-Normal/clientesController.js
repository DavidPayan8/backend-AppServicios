const { getClientes } = require('../models/clientesModel');

const getClientesHandler = async (req, res) => {
  try {
    const { empresa } = req.user

    const clientes = await getClientes(empresa);
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getClientes: getClientesHandler
};