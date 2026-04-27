const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const { authorizeModule } = require('../middleware/moduleMiddleware');
const {
  ficharEntradaHandler,
  ficharSalidaHandler,
  obtenerPartesUsuarioFecha,
  cerrarParteAbierto,
  actualizarLocalizacionEntrada,
  actualizarLocalizacionSalida,
} = require("../controllers/asistenciaController");

router.use(authenticateToken);


router.post("/entrada",authorizeModule("registro_horario"), ficharEntradaHandler);
router.post("/salida",authorizeModule("registro_horario"), ficharSalidaHandler);
router.patch("/actualizar-localizacion-entrada",authorizeModule("registro_horario"), actualizarLocalizacionEntrada);
router.patch("/actualizar-localizacion-salida",authorizeModule("registro_horario"), actualizarLocalizacionSalida);
router.get("/partes-usuario",authorizeModule("registro_horario"), obtenerPartesUsuarioFecha);
router.patch("/cerrar-parte",authorizeModule("registro_horario"), cerrarParteAbierto);

module.exports = router;
