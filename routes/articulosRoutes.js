const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { obtenerArticulosPorOt } = require('../controllers/articulosController');

router.use(authenticateToken);

router.post('/obtener-articulos', obtenerArticulosPorOt);


module.exports = router;