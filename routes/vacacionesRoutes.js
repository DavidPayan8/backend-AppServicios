const express = require('express');
const { obtenerTotalVacaciones, obtenerTiposVacacion, obtenerVacacionesAceptadas, obtenerVacacionesSolicitadas, solicitarVacaciones, obtenerVacacionesDenegadas } = require('../controllers/vacacionesController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/total', obtenerTotalVacaciones);
router.get('/tipos', obtenerTiposVacacion);
router.post('/aceptadas', obtenerVacacionesAceptadas);
router.post('/solicitadas', obtenerVacacionesSolicitadas);
router.post('/denegadas', obtenerVacacionesDenegadas);
router.put('/solicitar', solicitarVacaciones);

module.exports = router;