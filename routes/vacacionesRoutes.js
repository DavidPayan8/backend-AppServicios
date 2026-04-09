const express = require("express");
const {
  obtenerTotalVacaciones,
  obtenerTiposVacacion,
  obtenerVacacionesAceptadas,
  obtenerVacacionesSolicitadas,
  solicitarVacaciones,
  obtenerVacacionesDenegadas,
  obtenerDiasVacaciones,
  obtenerResumenVacaciones,
} = require("../controllers/vacacionesController");
const authenticateToken = require("../middleware/authMiddleware");
const { authorizeModule } = require('../middleware/moduleMiddleware');
const router = express.Router();

router.use(authenticateToken);
router.use(authorizeModule("portal_empleado", "vacaciones_portal"));

router.get("/total", obtenerTotalVacaciones);
router.get("/tipos", obtenerTiposVacacion);
router.post("/aceptadas", obtenerVacacionesAceptadas);
router.post("/solicitadas", obtenerVacacionesSolicitadas);
router.post("/denegadas", obtenerVacacionesDenegadas);
router.post("/resumen", obtenerResumenVacaciones);
router.put("/solicitar", solicitarVacaciones);
router.post("/dias", obtenerDiasVacaciones);

module.exports = router;
