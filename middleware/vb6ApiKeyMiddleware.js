/**
 * VB6 Bridge API Key Authentication Middleware
 * Validates the x-vb6-api-key header against the VB6_API_KEY environment variable.
 * Simpler than flutterApiKeyMiddleware — no DB lookup needed, single shared key.
 */

const vb6ApiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-vb6-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key requerida. Header 'x-vb6-api-key' no encontrado.",
    });
  }

  const expectedKey = process.env.VB6_API_KEY;

  if (!expectedKey) {
    console.error("VB6_API_KEY no está definida en las variables de entorno.");
    return res.status(500).json({
      success: false,
      message: "Configuración del servidor incompleta.",
    });
  }

  if (apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: "API key inválida.",
    });
  }

  next();
};

module.exports = vb6ApiKeyMiddleware;
