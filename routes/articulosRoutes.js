const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { authorizeModule } = require('../middleware/moduleMiddleware');
const { obtenerArticulos,get_iva_descuento, obtenerVehiculos } = require('../controllers/articulosController');

router.use(authenticateToken);

router.get('/obtener-articulos',authorizeModule("servicios", "albaran"), obtenerArticulos);
router.get('/obtener-vehiculos',authorizeModule("servicios"), obtenerVehiculos);
router.get('/obtener-ivas-descuentos',authorizeModule("servicios", "albaran"), get_iva_descuento);


module.exports = router;