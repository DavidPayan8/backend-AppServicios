const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { obtenerArticulos,get_iva_descuento, obtenerVehiculos } = require('../controllers/articulosController');

router.use(authenticateToken);

router.post('/obtener-articulos', obtenerArticulos);
router.post('/obtener-vehiculos', obtenerVehiculos);
router.post('/obtener-ivas-descuentos', get_iva_descuento);


module.exports = router;