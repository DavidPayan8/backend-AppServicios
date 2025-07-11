const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  obtenerAnotaciones,
  obtenerNumAnotaciones,
} = require("../controllers/anotacionesController");

router.use(authenticateToken);

router.get("/", obtenerAnotaciones);
router.get("/total", obtenerNumAnotaciones);

module.exports = router;
