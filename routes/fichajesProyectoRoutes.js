const express = require("express");
const router = express.Router();
const { obtenerFichajesProyecto } = require("../controllers/fichajesProyectoController");

router.get("/", obtenerFichajesProyecto);

module.exports = router;
