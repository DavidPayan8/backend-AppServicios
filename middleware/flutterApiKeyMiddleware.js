const db = require("../Model");

/**
 * Flutter API Key Authentication Middleware
 * Validates the X-Flutter-API-Key header and loads the associated company
 */

const flutterApiKeyMiddleware = async (req, res, next) => {
  try {
    // Extract API key from header
    const apiKey = req.headers["x-flutter-api-key"];

    if (!apiKey) {
      console.log("API key:", apiKey);
      return res.status(401).json({
        success: false,
        message: "API key requerida. Header 'X-Flutter-API-Key' no encontrado",
      });
    }

    // Find company by API key
    const configEmpresa = await db.CONFIG_EMPRESA.findOne({
      where: { flutter_api_key: apiKey },
      include: [
        {
          model: db.EMPRESA,
          as: "empresa",
          attributes: ["id_empresa", "nombre"],
        },
      ],
    });

    if (!configEmpresa || !configEmpresa.empresa) {
      return res.status(401).json({
        success: false,
        message: "API key inválida o empresa no encontrada",
      });
    }

    // Attach company information to request
    req.empresa = {
      id: configEmpresa.empresa.id_empresa,
      nombre: configEmpresa.empresa.nombre,
      config_id: configEmpresa.id,
    };

    next();
  } catch (error) {
    console.error("Error en flutterApiKeyMiddleware:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor al validar API key",
    });
  }
};

module.exports = flutterApiKeyMiddleware;
