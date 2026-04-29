const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { authorizeModule } = require('../middleware/moduleMiddleware');
const {
  obtenerInmovilizados,
  obtenerMovimientos,
  crearMovimiento,
  actualizarInmovilizado,
  actualizarMovimiento,
  crearInmovilizado
} = require('../controllers/inmovilizadoController');

router.use(authenticateToken);
router.use(authorizeModule("portal_empleado", "material_inmovilizado"));

router.get('/inmovilizados', obtenerInmovilizados);
router.get('/movimientos', obtenerMovimientos);
router.post('/movimientos', crearMovimiento);
router.put('/movimientos/:id', actualizarMovimiento);
router.post('/inmovilizados', crearInmovilizado);
router.put('/inmovilizados/:id', actualizarInmovilizado);

module.exports = router;
