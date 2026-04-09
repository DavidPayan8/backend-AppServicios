/**
 * VB6 Bridge API Key Authentication Middleware
 *
 * Validates the x-vb6-api-key header. Supports two modes:
 *   1. Per-company keys stored in CONFIG_EMPRESA.vb6_api_key (preferred)
 *   2. Fallback to single shared VB6_API_KEY env variable (legacy)
 *
 * If the key matches a per-company key, req.vb6Empresa is populated
 * with the company info. If it matches the env var, req.vb6Empresa is null.
 */

const db = require("../Model");

const vb6ApiKeyMiddleware = async (req, res, next) => {
  const apiKey = req.headers["x-vb6-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key requerida. Header 'x-vb6-api-key' no encontrado.",
    });
  }

  try {
    // 1. Try per-company key from DB
    const configEmpresa = await db.CONFIG_EMPRESA.findOne({
      where: { vb6_api_key: apiKey },
      include: [
        {
          model: db.EMPRESA,
          as: "empresa",
          attributes: ["id_empresa", "nombre"],
        },
      ],
    });

    if (configEmpresa) {
      req.vb6Empresa = configEmpresa.empresa;
      return next();
    }

    // 2. Fallback to env variable (legacy single shared key)
    const expectedKey = process.env.VB6_API_KEY;

    if (expectedKey && apiKey === expectedKey) {
      req.vb6Empresa = null;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "API key inválida.",
    });
  } catch (error) {
    console.error("Error en vb6ApiKeyMiddleware:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor al validar API key.",
    });
  }
};

module.exports = vb6ApiKeyMiddleware;
