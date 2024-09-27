const express = require("express");
const {
  obtenerNotificaciones,
  obtenerArchivadas,
  marcarLeida,
} = require("../controllers/notificacionesController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.post("/obtener-notificaciones", obtenerNotificaciones);
router.post("/obtener-archivadas", obtenerArchivadas);
router.post("/marcar-leida", marcarLeida);

module.exports = router;
