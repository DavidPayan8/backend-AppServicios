const express = require("express");
const {
  darAltaEmpleado,
  getEmpleados,
  getDetalles,
  editarEmpleado,
  getVacaciones,
  getVacacion,
  actualizarVacacion,
  getCambiosEstado,
} = require("../controllers/adminController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRol = require("../middleware/authorizeMiddleware");
const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRol("admin", "superadmin"));

router.put("/alta", darAltaEmpleado);
router.get("/empleados", getEmpleados);
router.get("/detalles", getDetalles);
router.put("/editar", editarEmpleado);
router.post("/vacaciones", getVacaciones);
router.post("/vacacion", getVacacion);
router.put("/actualizarVacacion", actualizarVacacion);
router.post("/cambiosVacacion", getCambiosEstado);

module.exports = router;
