const configuracionService = require("../models/configuracionesModel");

const obtenerDiasEditables = async (req, res) => {
  const { rol } = req.body;

  try {
    const config = await configuracionService.obtenerDiasEditables(rol);

    res.status(200).json(config);
  } catch (error) {
    console.error("Error al obtener dias editables:", error.message);
    res.status(500).json({
      message: "Error al obtener dias editables.",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerDiasEditables,
};
