const express = require('express');
const { obtenerListadoFtp } = require('../controllers/ftpController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/obtener-listado',obtenerListadoFtp);

module.exports = router