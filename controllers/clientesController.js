const db = require("../Model");

const getClientesHandler = async (req, res) => {
  try {
    const { empresa } = req.user;

    const clientes = await db.CLIENTES.findAll({
      where: {
        id_empresa: empresa,
      },
    });

    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  getClientes: getClientesHandler,
};
