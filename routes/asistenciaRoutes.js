const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  ficharEntradaHandler,
  ficharSalidaHandler,
  obtenerPartesUsuarioFecha,
  cerrarParteAbierto,
  actualizarLocalizacionEntrada,
  actualizarLocalizacionSalida,
} = require("../controllers/asistenciaController");

router.use(authenticateToken);

router.post("/entrada", ficharEntradaHandler);
router.post("/salida", ficharSalidaHandler);
router.patch("/actualizar-localizacion-entrada", actualizarLocalizacionEntrada);
router.patch("/actualizar-localizacion-salida", actualizarLocalizacionSalida);
router.get("/partes-usuario", obtenerPartesUsuarioFecha);
router.patch("/cerrar-parte", cerrarParteAbierto);

module.exports = router;
