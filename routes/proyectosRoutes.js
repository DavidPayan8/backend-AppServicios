const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { obtenerIdProyectos, obtenerProyectosPorIds, crearProyecto  } = require('../controllers/proyectosController');

router.use(authenticateToken);

router.get('/id-proyectos', obtenerIdProyectos);
router.post('/proyectos', obtenerProyectosPorIds);
router.post('/crear-proyectos', crearProyecto);

module.exports = router;