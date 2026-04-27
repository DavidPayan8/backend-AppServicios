const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { authorizeModule } = require('../middleware/moduleMiddleware');
const { getJornadas, getJornadaById, createJornada, updateJornada, deleteJornada } = require('../controllers/horariosController');

router.use(authenticateToken);
router.use(authorizeModule("panel_gestion", "horarios_panel"));


router.get('/', getJornadas);
router.get('/:id', getJornadaById);
router.post('/', createJornada);
router.put('/:id', updateJornada);
router.delete('/:id', deleteJornada);

module.exports = router;
