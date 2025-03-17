const { obtenerDiasEditables,getConfigEmpresa } = require("../models/configuracionesModel");

const getDiasEditables = async (req, res) => {
  const { rol } = req.body;

  try {
    const config = await obtenerDiasEditables(rol);

    res.status(200).json(config);
  } catch (error) {
    console.error("Error al obtener dias editables:", error.message);
    res.status(500).json({
      message: "Error al obtener dias editables.",
      error: error.message,
    });
  }
};

const obtenerConfigEmpresa = async (req,res) => {
  try {
    const empresa = req.user.empresa;

    const config = await getConfigEmpresa(empresa);

    res.status(200).json(config);
  } catch (error) {
    console.error("Error al obtener config empresa:", error.message);
    res.status(500).json({
      message: "Error al obtener configuracion empresa",
      error: error.message,
    });
  }
};

module.exports = {
  getDiasEditables,
  obtenerConfigEmpresa
};
