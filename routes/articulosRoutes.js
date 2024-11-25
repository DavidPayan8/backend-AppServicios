const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { obtenerArticulos,get_iva_descuento } = require('../controllers/articulosController');

router.use(authenticateToken);

router.post('/obtener-articulos', obtenerArticulos);
router.post('/obtener-ivas-descuentos', get_iva_descuento);


module.exports = router;