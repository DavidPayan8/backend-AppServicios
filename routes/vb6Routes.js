const express = require("express");
const router = express.Router();
const vb6ApiKeyMiddleware = require("../middleware/vb6ApiKeyMiddleware");
const { enviarPush, hashPassword } = require("../controllers/vb6Controller");

// Todas las rutas VB6 requieren la API key del bridge
router.use(vb6ApiKeyMiddleware);

/**
 * POST /api/vb6/push
 * Envía un WebPush directamente a los navegadores suscritos de los usuarios.
 *
 * Body: { destino: [id1, id2], asunto: "...", cuerpo: "...", url?: "..." }
 */
router.post("/push", enviarPush);

/**
 * POST /api/vb6/hash-password
 * Devuelve el hash bcrypt de una contraseña en texto plano.
 *
 * Body: { password: "mi_contraseña" }
 * Response: { success: true, hash: "$2b$10$..." }
 */
router.post("/hash-password", hashPassword);

module.exports = router;
