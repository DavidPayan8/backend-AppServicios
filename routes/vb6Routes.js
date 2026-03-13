const express = require("express");
const router = express.Router();
const vb6ApiKeyMiddleware = require("../middleware/vb6ApiKeyMiddleware");
const { enviarPush } = require("../controllers/vb6Controller");

// Todas las rutas VB6 requieren la API key del bridge
router.use(vb6ApiKeyMiddleware);

/**
 * POST /api/vb6/push
 * Envía un WebPush directamente a los navegadores suscritos de los usuarios.
 *
 * Body: { destino: [id1, id2], asunto: "...", cuerpo: "...", url?: "..." }
 */
router.post("/push", enviarPush);

module.exports = router;
