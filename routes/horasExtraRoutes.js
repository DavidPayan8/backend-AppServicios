const express = require('express');
const router = express.Router();
const horasExtraController = require('../controllers/horasExtraController');
const authenticateToken = require("../middleware/authMiddleware");
const { authorizeModule } = require('../middleware/moduleMiddleware');

router.use(authenticateToken);
router.use(authorizeModule("portal_empleado", "horas_extra"));

/**
 * @route   GET /api/horas-extra
 * @desc    Obtener todas las horas extra del empleado autenticado
 * @access  Private
 * @query   page, limit, fechaDesde, fechaHasta
 */
router.get('/', horasExtraController.obtenerHorasExtra);

/**
 * @route   GET /api/horas-extra/:id
 * @desc    Obtener una hora extra por ID
 * @access  Private
 */
router.get('/:id', horasExtraController.obtenerHoraExtraPorId);

/**
 * @route   POST /api/horas-extra
 * @desc    Crear una nueva entrada de horas extra
 * @access  Private
 * @body    { fecha, horaInicio, horaFin, descripcion? }
 */
router.post('/', horasExtraController.crearHoraExtra);

/**
 * @route   PUT /api/horas-extra/:id
 * @desc    Actualizar una hora extra
 * @access  Private
 * @body    Campos a actualizar
 */
router.put('/:id', horasExtraController.actualizarHoraExtra);

/**
 * @route   DELETE /api/horas-extra/:id
 * @desc    Eliminar una hora extra
 * @access  Private
 */
router.delete('/:id', horasExtraController.eliminarHoraExtra);

module.exports = router;
