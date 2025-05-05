const express = require("express");
const {
  getEmpresa,
  getEmpresas,
  getColorPrincipal,
  updateEmpresa,
  updateConfigEmpresa,
} = require("../controllers/empresaController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRol = require("../middleware/authorizeMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.get("/", authorizeRol("admin", "superadmin"), getEmpresa);
router.get("/empresas", authorizeRol("superadmin"), getEmpresas);
router.put("/", authorizeRol("admin", "superadmin"), updateEmpresa);
router.put(
  "/configuracion",
  authorizeRol("admin", "superadmin"),
  updateConfigEmpresa
);
router.get("/color-principal", getColorPrincipal);

/* router.get("/modulos-habilitados") */

module.exports = router;
