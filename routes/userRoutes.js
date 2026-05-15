const express = require('express');
const { getUsers, getPerfil, actualizarPerfil, cambiarPrimerInicio, deleteUserBySuperadmin } = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRol = require('../middleware/authorizeMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getUsers);
router.get('/perfil', getPerfil);
router.patch('/perfil', actualizarPerfil);
router.patch('/primer-inicio', cambiarPrimerInicio);
router.delete('/:id', authorizeRol('superadmin'), deleteUserBySuperadmin);

module.exports = router;