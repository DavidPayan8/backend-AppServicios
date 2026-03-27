const express = require('express');
const { obtenerHorasTotales, obtenerDatosTabla } = require('../controllers/estadisticasController');
const authenticateToken = require('../middleware/authMiddleware');
const { authorizeModule } = require('../middleware/moduleMiddleware');
const router = express.Router();

router.use(authenticateToken);
router.use(authorizeModule("portal_empleado", "registro_empleado"));

router.post('/estadisticas-HorasTotales', obtenerHorasTotales);
router.post('/estadisticas-formatoTabla', obtenerDatosTabla);


module.exports = router;