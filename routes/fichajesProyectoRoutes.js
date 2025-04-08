const express = require("express");
const router = express.Router();
const { obtenerFichajesProyecto } = require("../controllers/fichajesProyectoController");
const { eliminarFichajes } = require("../controllers/fichajesProyectoController");
const { patchFichaje } = require("../controllers/fichajesProyectoController");

router.get("/", obtenerFichajesProyecto);
router.delete("/", eliminarFichajes);
router.patch("/", patchFichaje);

module.exports = router;
