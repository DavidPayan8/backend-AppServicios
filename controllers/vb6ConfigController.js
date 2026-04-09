const db = require("../Model");
const crypto = require("crypto");

/**
 * VB6 API Key Management Controller
 * Handles generation, regeneration, and revocation of VB6 Bridge API keys per company
 */

const generateVb6ApiKey = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const configEmpresa = await db.CONFIG_EMPRESA.findOne({
      where: { id_empresa },
      include: [
        {
          model: db.EMPRESA,
          as: "empresa",
          attributes: ["id_empresa", "nombre"],
        },
      ],
    });

    if (!configEmpresa) {
      return res.status(404).json({
        success: false,
        message: "Configuración de empresa no encontrada",
      });
    }

    if (configEmpresa.vb6_api_key) {
      return res.status(400).json({
        success: false,
        message:
          "La empresa ya tiene un API key VB6. Use el endpoint de regeneración",
      });
    }

    const apiKey = crypto.randomBytes(32).toString("hex");

    configEmpresa.vb6_api_key = apiKey;
    await configEmpresa.save();

    return res.status(200).json({
      success: true,
      message: "API key VB6 generada exitosamente",
      data: {
        empresa: configEmpresa.empresa.nombre,
        api_key: apiKey,
      },
    });
  } catch (error) {
    console.error("Error en generateVb6ApiKey:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

const regenerateVb6ApiKey = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const configEmpresa = await db.CONFIG_EMPRESA.findOne({
      where: { id_empresa },
      include: [
        {
          model: db.EMPRESA,
          as: "empresa",
          attributes: ["id_empresa", "nombre"],
        },
      ],
    });

    if (!configEmpresa) {
      return res.status(404).json({
        success: false,
        message: "Configuración de empresa no encontrada",
      });
    }

    const apiKey = crypto.randomBytes(32).toString("hex");

    const oldKey = configEmpresa.vb6_api_key;
    configEmpresa.vb6_api_key = apiKey;
    await configEmpresa.save();

    return res.status(200).json({
      success: true,
      message:
        "API key VB6 regenerada exitosamente. La clave anterior ha sido invalidada",
      data: {
        empresa: configEmpresa.empresa.nombre,
        api_key: apiKey,
        had_previous_key: !!oldKey,
      },
    });
  } catch (error) {
    console.error("Error en regenerateVb6ApiKey:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

const revokeVb6ApiKey = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const configEmpresa = await db.CONFIG_EMPRESA.findOne({
      where: { id_empresa },
      include: [
        {
          model: db.EMPRESA,
          as: "empresa",
          attributes: ["id_empresa", "nombre"],
        },
      ],
    });

    if (!configEmpresa) {
      return res.status(404).json({
        success: false,
        message: "Configuración de empresa no encontrada",
      });
    }

    if (!configEmpresa.vb6_api_key) {
      return res.status(400).json({
        success: false,
        message: "La empresa no tiene un API key VB6 activo",
      });
    }

    configEmpresa.vb6_api_key = null;
    await configEmpresa.save();

    return res.status(200).json({
      success: true,
      message: "API key VB6 revocada exitosamente",
      data: {
        empresa: configEmpresa.empresa.nombre,
      },
    });
  } catch (error) {
    console.error("Error en revokeVb6ApiKey:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

const getVb6ApiKey = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const configEmpresa = await db.CONFIG_EMPRESA.findOne({
      where: { id_empresa },
      include: [
        {
          model: db.EMPRESA,
          as: "empresa",
          attributes: ["id_empresa", "nombre"],
        },
      ],
    });

    if (!configEmpresa) {
      return res.status(404).json({
        success: false,
        message: "Configuración de empresa no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        empresa: configEmpresa.empresa.nombre,
        api_key: configEmpresa.vb6_api_key,
        has_api_key: !!configEmpresa.vb6_api_key,
      },
    });
  } catch (error) {
    console.error("Error en getVb6ApiKey:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

module.exports = {
  generateVb6ApiKey,
  regenerateVb6ApiKey,
  revokeVb6ApiKey,
  getVb6ApiKey,
};
