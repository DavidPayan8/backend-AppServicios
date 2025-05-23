const db = require("../Model");

const getDiasEditables = async (req, res) => {
  const { empresa, rol } = req.user;

  try {
    const config = await db.CONFIGURACIONES.findOne({
      where: {
        id_empresa: empresa,
        rol,
      },
      attributes: ["n_dias_editables"],
    });

    if (!config) {
      return res.status(200).json({ message: "Configuración no encontrada" });
    }

    res.status(200).json(config);
  } catch (error) {
    console.error("Error al obtener días editables:", error.message);
    res.status(500).json({
      message: "Error al obtener días editables.",
      error: error.message,
    });
  }
};

const obtenerConfigEmpresa = async (req, res) => {
  const { empresa } = req.user;

  try {
    const config = await db.CONFIG_EMPRESA.findOne({
      where: { id_empresa: empresa },
    });

    if (!config) {
      return res.status(404).json({ message: "Configuración no encontrada" });
    }

    res.status(200).json(config);
  } catch (error) {
    console.error("Error al obtener config empresa:", error.message);
    res.status(500).json({
      message: "Error al obtener configuración empresa",
      error: error.message,
    });
  }
};

module.exports = {
  getDiasEditables,
  obtenerConfigEmpresa,
};
