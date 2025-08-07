const express = require('express');
const { getClientes, getById, getPeticionarios } = require('../controllers/clientesController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getClientes);
router.get('/:cliente_id', getById);
router.get('/peticionario/:cliente_id', getPeticionarios)

module.exports = router;

