const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { obtenerArticulos } = require('../controllers/articulosController');

router.use(authenticateToken);

router.post('/obtener-articulos', obtenerArticulos);


module.exports = router;