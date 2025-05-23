const express = require("express");
const {
  getEmpresa,
  getEmpresas,
  getConfigEmpresa,
  updateEmpresa,
  updateConfigEmpresa,
} = require("../controllers/empresaController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRol = require("../middleware/authorizeMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.get("/", authorizeRol("admin", "superadmin"), getEmpresa);
router.get("/config", getConfigEmpresa)
router.get("/empresas", authorizeRol("superadmin"), getEmpresas);
router.put("/", authorizeRol("admin", "superadmin"), updateEmpresa);
router.put(
  "/configuracion",
  authorizeRol("admin", "superadmin"),
  updateConfigEmpresa
);

module.exports = router;
