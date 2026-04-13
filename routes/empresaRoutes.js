const express = require("express");
const {
  getEmpresa,
  getEmpresas,
  getConfigEmpresa,
  updateEmpresa,
  updateConfigEmpresa,
  getCountUsersByEmpresa,
  updateEmpresaCompleta,
  createEmpresaCompleta,
  updateColorPrincipal,
} = require("../controllers/empresaController");
const {
  getFlutterApiKey,
  generateFlutterApiKey,
  regenerateFlutterApiKey,
  revokeFlutterApiKey,
} = require("../controllers/flutterConfigController");
const {
  getVb6ApiKey,
  generateVb6ApiKey,
  regenerateVb6ApiKey,
  revokeVb6ApiKey,
} = require("../controllers/vb6ConfigController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRol = require("../middleware/authorizeMiddleware");
const verifyAccess = require("../middleware/superadminMiddleware");
const router = express.Router();

// Rutas públicas (sin autenticación)
router.post("/superadmin/verify-code", verifyAccess, (req, res) => {
  res.status(200).json({ message: "Acceso concedido" });
});

// Todas las demás rutas requieren autenticación
router.use(authenticateToken);

router.get("/config", getConfigEmpresa);

router.get("/", authorizeRol("admin", "superadmin"), getEmpresa);
router.put("/config", authorizeRol("admin", "superadmin"), updateColorPrincipal);
router.get("/empresas", authorizeRol("superadmin"), getEmpresas);
router.get("/:id/users", authorizeRol("superadmin"), getCountUsersByEmpresa);
router.put("/", authorizeRol("admin", "superadmin"), updateEmpresa);

router.put(
  "/configuracion",
  authorizeRol("admin", "superadmin"),
  updateConfigEmpresa
);

router.post("/completa", authorizeRol("superadmin"), createEmpresaCompleta);
router.put("/completa", authorizeRol("superadmin"), updateEmpresaCompleta);

// --- API Keys Management (superadmin only) ---

// Flutter API Keys
router.get("/api-keys/flutter/:id_empresa", authorizeRol("superadmin"), getFlutterApiKey);
router.post("/api-keys/flutter/generate/:id_empresa", authorizeRol("superadmin"), generateFlutterApiKey);
router.post("/api-keys/flutter/regenerate/:id_empresa", authorizeRol("superadmin"), regenerateFlutterApiKey);
router.delete("/api-keys/flutter/revoke/:id_empresa", authorizeRol("superadmin"), revokeFlutterApiKey);

// VB6 Bridge API Keys
router.get("/api-keys/vb6/:id_empresa", authorizeRol("superadmin"), getVb6ApiKey);
router.post("/api-keys/vb6/generate/:id_empresa", authorizeRol("superadmin"), generateVb6ApiKey);
router.post("/api-keys/vb6/regenerate/:id_empresa", authorizeRol("superadmin"), regenerateVb6ApiKey);
router.delete("/api-keys/vb6/revoke/:id_empresa", authorizeRol("superadmin"), revokeVb6ApiKey);

module.exports = router;
