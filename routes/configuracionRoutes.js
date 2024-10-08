const express = require('express');
const { obtenerDiasEditables } = require('../controllers/configuracionesController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.post('/obtener-dias-editables', obtenerDiasEditables);

module.exports = router;