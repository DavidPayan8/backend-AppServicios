const express = require('express');
const { getClientes } = require('../controllers/clientesController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/obtener-clientes', getClientes);

module.exports = router;

