const express = require('express');
const { getUsers, getPerfil, actualizarPerfil, cambiarPrimerInicio } = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getUsers);
router.get('/perfil', getPerfil);
router.patch('/perfil', actualizarPerfil);
router.patch('/primer-inicio', cambiarPrimerInicio);

module.exports = router;