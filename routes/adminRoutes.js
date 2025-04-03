const express = require("express");
const { darAltaEmpleado, getEmpleados } = require("../controllers/adminController");

const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.put("/alta", darAltaEmpleado);
router.post("/empleados", getEmpleados)

module.exports = router;