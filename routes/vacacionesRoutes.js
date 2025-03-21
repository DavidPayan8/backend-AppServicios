const express = require('express');
const { obtenerTotalVacaciones, obtenerTiposVacacion, obtenerVacacionesAceptadas, obtenerVacacionesSolicitadas } = require('../controllers/vacacionesController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/total', authenticateToken, obtenerTotalVacaciones);
router.get('/tipos', authenticateToken, obtenerTiposVacacion);
router.post('/aceptadas', authenticateToken, obtenerVacacionesAceptadas);
router.post('/solicitadas', authenticateToken, obtenerVacacionesSolicitadas);

module.exports = router;