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
  getNoAsignados,
  getAllProyects,
  getByIdLaTorre,
  obtenerOTsConstruccion
} = require("../controllers/proyectosController");
const authorizeCategory = require("../middleware/categoryMiddleware");

router.use(authenticateToken);

// Tipo Servicio
router.get("/id-proyectos", obtenerIdProyectos);
router.get("/proyectos", obtenerProyectosPorIds);
router.post("/crear-proyectos", crearProyecto);
router.get("/obtener-proyectos", obtenerProyecto);
router.post("/cambiar-estado", cambiarEstado);
router.get("/obtener-contrato", obtenerContrato);

router.post("/auto-asignar-ot", autoAsignarOrdenTrabajo);
router.post("/reasignar", authorizeCategory("tecnico"), reasignarOt);
router.get("/all-users", authorizeCategory("tecnico"), getProjectsAllWorkers);
router.get("/no-asignados", authorizeCategory("tecnico"), getNoAsignados)

// Tipo construccion
router.get("/obtener-obras", obtenerObras);
router.post("/crear-ot-obra", crearOtObra);
router.get("/ot-construccion",obtenerOTsConstruccion)

//LaTorre
router.get("/all", getAllProyects);
router.get("/la-torre/:id", getByIdLaTorre)

// Actividades
router.get("/obtener-actividades", obtenerActividades);
router.post("/actividad", createActividad);

module.exports = router;
