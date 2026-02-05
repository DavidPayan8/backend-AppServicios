const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  generateFlutterApiKey,
  regenerateFlutterApiKey,
  revokeFlutterApiKey,
  getFlutterApiKey,
} = require("../controllers/flutterConfigController");

// All routes require JWT authentication
router.use(authenticateToken);

// GET /flutter-api-key/:id_empresa - Get current API key
router.get("/flutter-api-key/:id_empresa", getFlutterApiKey);

// POST /flutter-api-key/generate/:id_empresa - Generate new API key
router.post("/flutter-api-key/generate/:id_empresa", generateFlutterApiKey);

// POST /flutter-api-key/regenerate/:id_empresa - Regenerate API key
router.post("/flutter-api-key/regenerate/:id_empresa", regenerateFlutterApiKey);

// DELETE /flutter-api-key/revoke/:id_empresa - Revoke API key
router.delete("/flutter-api-key/revoke/:id_empresa", revokeFlutterApiKey);

module.exports = router;
