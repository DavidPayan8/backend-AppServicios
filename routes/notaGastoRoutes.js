const express = require('express');
const router = express.Router();
const uploadMiddleware = require("../middleware/fileMiddleware");
const notaGastoController = require('../controllers/notaGastoController');
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

/**
 * @route   GET /api/notas-gasto
 * @desc    Obtener todas las notas de gasto con filtros
 * @access  Private
 * @query   estado, empleado, departamento, fechaDesde, fechaHasta, page, pageSize
 */
router.get('/', notaGastoController.obtenerNotasGasto);

/**
 * @route   GET /api/notas-gasto/estadisticas
 * @desc    Obtener estadísticas de gastos
 * @access  Private
 * @query   empleado, departamento, fechaDesde, fechaHasta
 */
router.get('/estadisticas', notaGastoController.obtenerEstadisticas);

/**
 * @route   GET /api/notas-gasto/:id
 * @desc    Obtener una nota de gasto por ID
 * @access  Private
 */
router.get('/:id', notaGastoController.obtenerNotaGastoPorId);

/**
 * @route   POST /api/notas-gasto
 * @desc    Crear una nueva nota de gasto
 * @access  Private
 * @body    { empleado, departamento, proyecto, fechaSolicitud, lineasGasto, observaciones }
 */
router.post('/', notaGastoController.crearNotaGasto);

/**
 * @route   PUT /api/notas-gasto/:id
 * @desc    Actualizar una nota de gasto
 * @access  Private
 * @body    Campos a actualizar
 */
router.put('/:id', notaGastoController.actualizarNotaGasto);

/**
 * @route   PUT /api/notas-gasto/:id/enviar
 * @desc    Enviar nota de gasto para aprobación
 * @access  Private
 * @body    Datos de la nota de gasto
 */
router.put('/:id/enviar', notaGastoController.enviarParaAprobacion);

/**
 * @route   POST /api/notas-gasto/:id/aprobar
 * @desc    Aprobar una nota de gasto
 * @access  Private (Manager/RRHH)
 * @body    { aprobadoPor, comentarios? }
 */
router.post('/:id/aprobar', notaGastoController.aprobarNotaGasto);

/**
 * @route   POST /api/notas-gasto/:id/rechazar
 * @desc    Rechazar una nota de gasto
 * @access  Private (Manager/RRHH)
 * @body    { motivoRechazo, rechazadoPor }
 */
router.post('/:id/rechazar', notaGastoController.rechazarNotaGasto);

/**
 * @route   DELETE /api/notas-gasto/:id
 * @desc    Eliminar una nota de gasto
 * @access  Private
 */
router.delete('/:id', notaGastoController.eliminarNotaGasto);

/**
 * @route   POST /api/notas-gasto/upload-ticket
 * @desc    Subir archivo de ticket/factura
 * @access  Private
 * @body    FormData con el archivo
 */
router.post('/eliminar-ticket-gasto', notaGastoController.eliminarTicketGasto);

router.post('/upload-ticket', uploadMiddleware, notaGastoController.subirTicket);

module.exports = router;