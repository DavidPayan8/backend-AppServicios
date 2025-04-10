const express = require("express");
const router = express.Router();
const { obtenerFichajesProyecto,eliminarFichajes,patchFichaje } = require("../controllers/fichajesProyectoController");
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get("/", obtenerFichajesProyecto);
router.delete("/", eliminarFichajes);
router.patch("/", patchFichaje);

module.exports = router;
