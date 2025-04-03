const express = require('express');
const { obtenerHorasTotales, obtenerHorasformatoTabla } = require('../controllers/estadisticasController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.post('/estadisticas-HorasTotales', obtenerHorasTotales);
router.post('/estadisticas-formatoTabla', obtenerHorasformatoTabla);


module.exports = router;