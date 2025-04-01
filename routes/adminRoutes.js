const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { darAltaEmpleado } = require("../controllers/adminController");

router.use(authenticateToken);

router.put("/alta", darAltaEmpleado);

module.exports = router;