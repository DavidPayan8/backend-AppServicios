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
const { authorizeModule } = require("../middleware/moduleMiddleware");

router.use(authenticateToken);

// Tipo Servicio

//ruta de prueba: 
// router.put("/param", middleware('nombreModulo', 'nombreSubModulo'), call);

router.get("/id-proyectos", authorizeModule("servicios"), obtenerIdProyectos);
router.get("/proyectos", authorizeModule("servicios"), obtenerProyectosPorIds);
router.post("/crear-proyectos", authorizeModule("servicios"), crearProyecto);
router.get("/obtener-proyectos", authorizeModule("servicios"), obtenerProyecto);
router.post("/cambiar-estado", authorizeModule("servicios"), cambiarEstado);
router.get("/obtener-contrato", authorizeModule("servicios", "contrato"), obtenerContrato);

router.post("/auto-asignar-ot", authorizeModule("servicios"), autoAsignarOrdenTrabajo);
router.post("/reasignar", authorizeCategory("tecnico"), authorizeModule("servicios"), reasignarOt);
router.get("/all-users", authorizeCategory("tecnico"), authorizeModule("servicios"), getProjectsAllWorkers);
router.get("/no-asignados", authorizeCategory("tecnico"), authorizeModule("servicios"), getNoAsignados)

// Tipo construccion
router.get("/obtener-obras", authorizeModule("servicios"), obtenerObras);
router.post("/crear-ot-obra", authorizeModule("servicios"), crearOtObra);
router.get("/ot-construccion",authorizeModule("servicios"),obtenerOTsConstruccion)

//LaTorre
router.get("/all", authorizeModule("la-torre"), getAllProyects);
router.get("/la-torre/:id", authorizeModule("la-torre"), getByIdLaTorre)

// Actividades
router.get("/obtener-actividades", authorizeModule("servicios", "detalles"), obtenerActividades);
router.post("/actividad", authorizeModule("servicios", "detalles"), createActividad);

module.exports = router;
