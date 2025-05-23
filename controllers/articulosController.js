const db = require("../Model");

const obtenerArticulos = async (req, res) => {
  try {
    const { empresa } = req.user;

    const articulos = await db.ARTICULOS.findAll({
      where: { id_empresa: empresa }
    });

    res.status(200).json(articulos);
  } catch (error) {
    console.error("Error al obtener lista articulos:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerVehiculos = async (req, res) => {
  try {
    const id_usuario= req.user.id;

    const vehiculos = await db.VEHICULOS.findAll({
      where: { id_usuario }
    });

    res.status(200).json(vehiculos);
  } catch (error) {
    console.error("Error al obtener vehiculos:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const get_iva_descuento = async (req, res) => {
  try {
    const { empresa } = req.user;

    const result = await db.EMPRESA.findOne({
      where: { id: empresa },
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener porcentajes:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  obtenerArticulos,
  obtenerVehiculos,
  get_iva_descuento
};
