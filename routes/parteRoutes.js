const express = require('express');
const { checkParteAbierto, crearParteTrabajo, getPartes, actualizarParteTrabajo,getCapitulos, getPartidas, getParte } = require('../controllers/parteController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.post('/check-parte-abierto', checkParteAbierto);

router.post('/crear-partes-trabajo', crearParteTrabajo);

router.post('/obtener-partes', getPartes);

router.post('/obtener-parte/:id', getParte);

router.post('/obtener-capitulos', getCapitulos);

router.post('/obtener-partidas', getPartidas);

router.patch('/actualizar-parte/:id', actualizarParteTrabajo);

module.exports = router;