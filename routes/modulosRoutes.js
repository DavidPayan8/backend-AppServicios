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

// Módulos
router.get("/", getModulos);
router.post("/", authorizeRol("superadmin"), createModulo);
router.put("/", authorizeRol("superadmin"), updateModulosEmpresa);

module.exports = router;
