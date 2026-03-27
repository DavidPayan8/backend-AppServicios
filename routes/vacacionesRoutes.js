const express = require("express");
const {
  obtenerTotalVacaciones,
  obtenerTiposVacacion,
  obtenerVacacionesAceptadas,
  obtenerVacacionesSolicitadas,
  solicitarVacaciones,
  obtenerVacacionesDenegadas,
  obtenerDiasVacaciones,
} = require("../controllers/vacacionesController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);
router.use(authorizeModule("portal_empleado", "vacaciones_portal"));

router.get("/total", obtenerTotalVacaciones);
router.get("/tipos", obtenerTiposVacacion);
router.post("/aceptadas", obtenerVacacionesAceptadas);
router.post("/solicitadas", obtenerVacacionesSolicitadas);
router.post("/denegadas", obtenerVacacionesDenegadas);
router.put("/solicitar", solicitarVacaciones);
router.post("/dias", obtenerDiasVacaciones);

module.exports = router;
