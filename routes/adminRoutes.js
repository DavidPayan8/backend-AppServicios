const express = require("express");
const { darAltaEmpleado, getEmpleados, getDetalles } = require("../controllers/adminController");

const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.put("/alta", darAltaEmpleado);
router.post("/empleados", getEmpleados);
router.post("/detalles", getDetalles);

module.exports = router;