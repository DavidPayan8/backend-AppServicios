const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { ficharEntradaHandler, ficharSalidaHandler, obtenerPartesUsuarioFecha } = require('../controllers/asistenciaController');

router.use(authenticateToken);

router.post('/entrada', ficharEntradaHandler);
router.post('/salida', ficharSalidaHandler);
router.get('/partes-usuario', obtenerPartesUsuarioFecha);


module.exports = router;