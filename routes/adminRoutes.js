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

router.put("/alta", authorizeModule('panel_gestion', 'alta_empleado'), darAltaEmpleado);
router.get("/empleados", authorizeModule('panel_gestion', 'listado_empleados'), getEmpleados);
router.get("/detalles", authorizeModule('panel_gestion', 'listado_empleados'), getDetalles);
router.put("/editar", authorizeModule('panel_gestion', 'listado_empleados'), editarEmpleado);
router.post("/vacaciones", authorizeModule('panel_gestion', 'vacaciones_panel'), getVacaciones);
router.post("/vacacion", authorizeModule('panel_gestion', 'vacaciones_panel'), getVacacion);
router.put("/actualizarVacacion", authorizeModule('panel_gestion', 'vacaciones_panel'), actualizarVacacion);
router.post("/cambiosVacacion", authorizeModule('panel_gestion', 'vacaciones_panel'), getCambiosEstado);

module.exports = router;
