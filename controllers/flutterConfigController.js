const db = require("../Model");
const crypto = require("crypto");

/**
 * Flutter API Key Management Controller
 * Handles generation, regeneration, and revocation of Flutter API keys
 */

/**
 * Generate a new API key for a company
 */
const generateFlutterApiKey = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    // Find company config
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

    // Check if API key already exists
    if (configEmpresa.flutter_api_key) {
      return res.status(400).json({
        success: false,
        message:
          "La empresa ya tiene un API key. Use el endpoint de regeneración",
      });
    }

    // Generate new API key (64 character hex string)
    const apiKey = crypto.randomBytes(32).toString("hex");

    // Update config
    configEmpresa.flutter_api_key = apiKey;
    await configEmpresa.save();

    return res.status(200).json({
      success: true,
      message: "API key generada exitosamente",
      data: {
        empresa: configEmpresa.empresa.nombre,
        api_key: apiKey,
      },
    });
  } catch (error) {
    console.error("Error en generateFlutterApiKey:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

/**
 * Regenerate API key for a company (invalidates old key)
 */
const regenerateFlutterApiKey = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    // Find company config
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

    // Generate new API key
    const apiKey = crypto.randomBytes(32).toString("hex");

    // Update config
    const oldKey = configEmpresa.flutter_api_key;
    configEmpresa.flutter_api_key = apiKey;
    await configEmpresa.save();

    return res.status(200).json({
      success: true,
      message:
        "API key regenerada exitosamente. La clave anterior ha sido invalidada",
      data: {
        empresa: configEmpresa.empresa.nombre,
        api_key: apiKey,
        had_previous_key: !!oldKey,
      },
    });
  } catch (error) {
    console.error("Error en regenerateFlutterApiKey:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

/**
 * Revoke API key for a company
 */
const revokeFlutterApiKey = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    // Find company config
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

    if (!configEmpresa.flutter_api_key) {
      return res.status(400).json({
        success: false,
        message: "La empresa no tiene un API key activo",
      });
    }

    // Revoke API key
    configEmpresa.flutter_api_key = null;
    await configEmpresa.save();

    return res.status(200).json({
      success: true,
      message: "API key revocada exitosamente",
      data: {
        empresa: configEmpresa.empresa.nombre,
      },
    });
  } catch (error) {
    console.error("Error en revokeFlutterApiKey:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

/**
 * Get current API key for a company
 */
const getFlutterApiKey = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    // Find company config
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
        api_key: configEmpresa.flutter_api_key,
        has_api_key: !!configEmpresa.flutter_api_key,
      },
    });
  } catch (error) {
    console.error("Error en getFlutterApiKey:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

module.exports = {
  generateFlutterApiKey,
  regenerateFlutterApiKey,
  revokeFlutterApiKey,
  getFlutterApiKey,
};
