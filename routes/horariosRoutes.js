const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { getJornadas, getJornadaById, createJornada, updateJornada, deleteJornada } = require('../controllers/horariosController');

router.use(authenticateToken);


router.get('/', getJornadas);
router.get('/:id', getJornadaById);
router.post('/', createJornada);
router.put('/:id', updateJornada);
router.delete('/:id', deleteJornada);

module.exports = router;
