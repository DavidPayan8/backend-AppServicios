const express = require("express");
const {
  obtenerNotificaciones,
  obtenerArchivadas,
  marcarLeida,
  crearNotificacion
} = require("../controllers/notificacionesController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.get("/", obtenerNotificaciones);
router.get("/archivadas", obtenerArchivadas);
router.post("/marcar-leida", marcarLeida);
router.put("/", crearNotificacion);

module.exports = router;
