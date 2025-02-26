const express = require('express');
const { obtenerHorasTotales } = require('../controllers/estadisticasController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.post('/estadisticas-HorasTotales', obtenerHorasTotales);

module.exports = router;