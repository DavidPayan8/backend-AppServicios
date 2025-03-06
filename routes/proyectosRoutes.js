const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  obtenerIdProyectos,
  obtenerProyectosPorIds,
  crearProyecto,
  obtenerProyecto,
  cambiarEstado,
  obtenerContrato,
  obtenerObras,
  crearOtObra
} = require("../controllers/proyectosController");

router.use(authenticateToken);

router.get("/id-proyectos", obtenerIdProyectos);
router.post("/proyectos", obtenerProyectosPorIds);
router.post("/crear-proyectos", crearProyecto);
router.post("/obtener-proyectos", obtenerProyecto);
router.post("/cambiar-estado", cambiarEstado);
router.post("/obtener-contrato", obtenerContrato);
router.get("/obtener-obras", obtenerObras);
router.post("/crear-ot-obra", crearOtObra)

module.exports = router;
