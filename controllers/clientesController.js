const db = require("../Model");
const { clienteCollection, clienteResource } = require("../resources/cliente");

const getClientesHandler = async (req, res) => {
  try {
    const { empresa } = req.user;

    const clientes = await db.CLIENTES.findAll({
      where: {
        id_empresa: empresa,
      },
      include: [
        {
          model: db.PETICIONARIO,
          as: 'cliente_peticionarios',
        }
      ]
    });

    res.status(200).json(clienteCollection(clientes));
  } catch (error) {
    console.error("Error al obtener clientes:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const getByIdHandler = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    const id = parseInt(req.params.cliente_id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const cliente = await db.CLIENTES.findByPk(id, {
      include: [
        {
          model: db.PETICIONARIO,
          as: 'cliente_peticionarios',
        }
      ]
    });

    res.status(200).json(clienteResource(cliente))
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error en el servidor", error })
  }
}

const getPeticionariosHandler = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    if (!cliente_id) {
      return res.status(400).json({ message: 'Bad request' });
    }

    const peticionarios = await db.PETICIONARIO.findAll({
      where: { cliente_id },
    });

    res.status(200).json(peticionarios);
  } catch (error) {
    console.error('Error al obtener los peticionarios:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener los peticionarios', error
    });
  }
};

module.exports = {
  getClientes: getClientesHandler,
  getById: getByIdHandler,
  getPeticionarios: getPeticionariosHandler
};
