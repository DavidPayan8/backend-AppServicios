const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { obtenerIdProyectos, obtenerProyectosPorIds, crearProyecto, obtenerProyecto  } = require('../controllers/proyectosController');

router.use(authenticateToken);

router.get('/id-proyectos', obtenerIdProyectos);
router.post('/proyectos', obtenerProyectosPorIds);
router.post('/crear-proyectos', crearProyecto);
router.post('/obtener-proyectos', obtenerProyecto);


module.exports = router;