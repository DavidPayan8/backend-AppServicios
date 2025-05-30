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
  crearOtObra,
  autoAsignarOrdenTrabajo,
  obtenerActividades,
  createActividad,
  getProjectsAllWorkers,
  reasignarOt,
} = require("../controllers/proyectosController");
const authorizeCategory = require("../middleware/categoryMiddleware");

router.use(authenticateToken);

router.get("/id-proyectos", obtenerIdProyectos);
router.get("/proyectos", obtenerProyectosPorIds);
router.get("/obtener-actividades", obtenerActividades);
router.post("/actividad", createActividad);
router.post("/crear-proyectos", crearProyecto);
router.get("/obtener-proyectos", obtenerProyecto);
router.post("/cambiar-estado", cambiarEstado);
router.get("/obtener-contrato", obtenerContrato);
router.get("/obtener-obras", obtenerObras);
router.post("/crear-ot-obra", crearOtObra);
router.post("/auto-asignar-ot", autoAsignarOrdenTrabajo);
router.post("/reasignar", authorizeCategory("tecnico"), reasignarOt);
router.get("/all-users", authorizeCategory("tecnico"), getProjectsAllWorkers);

module.exports = router;
