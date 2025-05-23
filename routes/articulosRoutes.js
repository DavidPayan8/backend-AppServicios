const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { obtenerArticulos,get_iva_descuento, obtenerVehiculos } = require('../controllers/articulosController');

router.use(authenticateToken);

router.get('/obtener-articulos', obtenerArticulos);
router.get('/obtener-vehiculos', obtenerVehiculos);
router.get('/obtener-ivas-descuentos', get_iva_descuento);


module.exports = router;