const express = require("express");
const router = express.Router();
const { obtenerFichajesProyecto, eliminarFichajes, patchFichaje, postFichaje } = require("../controllers/listadoFichajesController");
const authenticateToken = require("../middleware/authMiddleware");


router.use(authenticateToken);
router.use(authorizeModule("servicios", "fichaje"));

router.get("/", obtenerFichajesProyecto);
router.delete("/", eliminarFichajes);
router.patch("/", patchFichaje);
router.post("/", postFichaje);

module.exports = router;
