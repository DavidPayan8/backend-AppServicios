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
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRol = require("../middleware/authorizeMiddleware");
const verifyAccess = require("../middleware/superadminMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.get("/", authorizeRol("admin", "superadmin"), getEmpresa);
router.get("/config", getConfigEmpresa);
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

router.post("/superadmin/verify-code", verifyAccess, (req, res) => {
  res.status(200).json({ message: "Acceso concedido" });
})

module.exports = router;
