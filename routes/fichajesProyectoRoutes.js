const express = require("express");
const router = express.Router();
const { obtenerFichajesProyecto, eliminarFichajes, patchFichaje, postFichaje } = require("../controllers/fichajesProyectoController");
const authenticateToken = require("../middleware/authMiddleware");


router.use(authenticateToken);

router.get("/", obtenerFichajesProyecto);
router.delete("/", eliminarFichajes);
router.patch("/", patchFichaje);
router.post("/", postFichaje);

module.exports = router;
