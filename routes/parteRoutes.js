const express = require('express');
const { checkParteAbierto, crearParteTrabajo, getPartes, actualizarParteTrabajo,getCapitulos, getPartidas, getParte } = require('../controllers/parteController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/check-parte-abierto', checkParteAbierto);

router.post('/crear-partes-trabajo', crearParteTrabajo);

router.get('/obtener-partes', getPartes);

router.get('/obtener-parte/:id', getParte);

router.get('/obtener-capitulos', getCapitulos);

router.get('/obtener-partidas', getPartidas);

router.patch('/actualizar-parte/:id', actualizarParteTrabajo);

module.exports = router;