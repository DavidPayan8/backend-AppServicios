const express = require("express");
const router = express.Router();
const {
  getModulos,
  createModulo,
  updateModulosEmpresa,
} = require("../controllers/modulosController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRol = require("../middleware/authorizeMiddleware");

router.use(authenticateToken);
router.use(authorizeRol("superadmin"));

// Módulos
router.get("/", getModulos);
router.post("/", createModulo);
router.put("/", updateModulosEmpresa);

module.exports = router;
