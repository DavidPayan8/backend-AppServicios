const express = require('express');
const { getDiasEditables,obtenerConfigEmpresa } = require('../controllers/configuracionesController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/obtener-dias-editables', getDiasEditables);
router.get('/obtener-config-empresa' , obtenerConfigEmpresa)

module.exports = router;