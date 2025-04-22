const express = require("express");
const { darAltaEmpleado, getEmpleados, getDetalles, editarEmpleado } = require("../controllers/adminController");

const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.put("/alta", darAltaEmpleado);
router.get("/empleados", getEmpleados);
router.get("/detalles", getDetalles);
router.put("/editar", editarEmpleado);

module.exports = router;