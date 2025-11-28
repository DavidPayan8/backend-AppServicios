const { NotaGasto, ORDEN_TRABAJO } = require('../Model');
const { Op } = require('sequelize');
const { paginatedResponse } = require("../resources/helpers/paginator");

/**
 * Obtener todas las notas de gasto con filtros y paginación
 */
exports.obtenerNotasGasto = async (req, res) => {
    try {
        const {
            estado,
            empleado,
            departamento,
            fechaDesde,
            fechaHasta,
        } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const where = {};

        if (estado) {
            where.estado = estado;
        }

        if (empleado) {
            where.empleado = { [Op.like]: `%${empleado}%` };
        }

        if (departamento) {
            where.departamento = departamento;
        }

        if (fechaDesde || fechaHasta) {
            where.fechaSolicitud = {};
            if (fechaDesde) {
                where.fechaSolicitud[Op.gte] = fechaDesde;
            }
            if (fechaHasta) {
                where.fechaSolicitud[Op.lte] = fechaHasta;
            }
        }

        // Ejecutar consulta con paginación
        const { count, rows } = await NotaGasto.findAndCountAll({
            where,
            limit,
            offset,
            order: [["fechaCreacion", "DESC"]],
            include: [
                {
                    model: ORDEN_TRABAJO,
                    as: 'proyecto_rel',
                    attributes: ['nombre']
                }
            ]
        });

        // Si quisieras añadir estadísticas agregadas opcionales
        const totalStats = {
            totalImporte: rows.reduce((acc, nota) => acc + (nota.importe || 0), 0)
        };

        const data = rows.map(nota => ({
            ...nota.toJSON(),
            nombre_proyecto: nota.proyecto_rel ? nota.proyecto_rel.nombre : null
        }));

        const response = paginatedResponse(data, count, parseInt(page), limit, totalStats);


        res.status(200).json({
            success: true,
            ...response,
            message: "Notas de gasto obtenidas correctamente"
        });

    } catch (error) {
        console.error("Error al obtener notas de gasto:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las notas de gasto",
            error: error.message
        });
    }
};

/**
 * Obtener una nota de gasto por ID
 */
exports.obtenerNotaGastoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const notaGasto = await NotaGasto.findByPk(id);

        if (!notaGasto) {
            return res.status(404).json({
                success: false,
                message: 'Nota de gasto no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: notaGasto,
            message: 'Nota de gasto obtenida correctamente'
        });
    } catch (error) {
        console.error('Error al obtener nota de gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la nota de gasto',
            error: error.message
        });
    }
};

/**
 * Crear una nueva nota de gasto
 */
exports.crearNotaGasto = async (req, res) => {
    try {
        let notaGastoData = req.body;

        notaGastoData = {
            ...notaGastoData,
            empleado: req.user.id
        }

        console.log(notaGastoData)

        // Crear instancia temporal para validar
        const notaGastoTemp = NotaGasto.build(notaGastoData);
        const erroresValidacion = notaGastoTemp.validarLineasGasto();

        if (erroresValidacion.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: erroresValidacion
            });
        }

        // Crear la nota de gasto
        const notaGasto = await NotaGasto.create(notaGastoData);

        res.status(201).json({
            success: true,
            data: notaGasto,
            message: 'Nota de gasto creada correctamente'
        });
    } catch (error) {
        console.error('Error al crear nota de gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la nota de gasto',
            error: error.message
        });
    }
};

/**
 * Actualizar una nota de gasto
 */
exports.actualizarNotaGasto = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizacion = req.body;

        const notaGasto = await NotaGasto.findByPk(id);

        if (!notaGasto) {
            return res.status(404).json({
                success: false,
                message: 'Nota de gasto no encontrada'
            });
        }

        // No permitir editar si ya está aprobada
        if (notaGasto.estado === 'aprobada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede editar una nota de gasto aprobada'
            });
        }

        // Validar líneas de gasto si se están actualizando
        if (datosActualizacion.lineasGasto) {
            const notaGastoTemp = NotaGasto.build({
                ...notaGasto.toJSON(),
                ...datosActualizacion
            });
            const erroresValidacion = notaGastoTemp.validarLineasGasto();

            if (erroresValidacion.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: erroresValidacion
                });
            }
        }

        await notaGasto.update(datosActualizacion);

        res.status(200).json({
            success: true,
            data: notaGasto,
            message: 'Nota de gasto actualizada correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar nota de gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la nota de gasto',
            error: error.message
        });
    }
};

/**
 * Enviar nota de gasto para aprobación
 */
exports.enviarParaAprobacion = async (req, res) => {
    try {
        const { id } = req.params;
        const notaGastoData = req.body;

        let notaGasto;

        // Si tiene ID, actualizar existente, si no, crear nueva
        if (id && id !== 'undefined') {
            notaGasto = await NotaGasto.findByPk(id);

            if (!notaGasto) {
                return res.status(404).json({
                    success: false,
                    message: 'Nota de gasto no encontrada'
                });
            }

            if (notaGasto.estado === 'aprobada') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede enviar una nota ya aprobada'
                });
            }

            await notaGasto.update({
                ...notaGastoData,
                estado: 'pendiente'
            });
        } else {
            // Crear nueva nota directamente en estado pendiente
            notaGasto = await NotaGasto.create({
                ...notaGastoData,
                estado: 'pendiente'
            });
        }

        res.status(200).json({
            success: true,
            data: notaGasto,
            message: 'Nota de gasto enviada para aprobación correctamente'
        });
    } catch (error) {
        console.error('Error al enviar nota de gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar la nota de gasto',
            error: error.message
        });
    }
};

/**
 * Aprobar una nota de gasto
 */
exports.aprobarNotaGasto = async (req, res) => {
    try {
        const { id } = req.params;
        const { aprobadoPor, comentarios } = req.body;

        if (!aprobadoPor) {
            return res.status(400).json({
                success: false,
                message: 'El campo aprobadoPor es obligatorio'
            });
        }

        const notaGasto = await NotaGasto.findByPk(id);

        if (!notaGasto) {
            return res.status(404).json({
                success: false,
                message: 'Nota de gasto no encontrada'
            });
        }

        if (notaGasto.estado !== 'pendiente') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden aprobar notas en estado pendiente'
            });
        }

        await notaGasto.update({
            estado: 'aprobada',
            aprobadoPor,
            fechaAprobacion: new Date(),
            observaciones: comentarios || notaGasto.observaciones
        });

        res.status(200).json({
            success: true,
            data: notaGasto,
            message: 'Nota de gasto aprobada correctamente'
        });
    } catch (error) {
        console.error('Error al aprobar nota de gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al aprobar la nota de gasto',
            error: error.message
        });
    }
};

/**
 * Rechazar una nota de gasto
 */
exports.rechazarNotaGasto = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivoRechazo, rechazadoPor } = req.body;

        if (!motivoRechazo || !rechazadoPor) {
            return res.status(400).json({
                success: false,
                message: 'El motivo de rechazo y rechazadoPor son obligatorios'
            });
        }

        const notaGasto = await NotaGasto.findByPk(id);

        if (!notaGasto) {
            return res.status(404).json({
                success: false,
                message: 'Nota de gasto no encontrada'
            });
        }

        if (notaGasto.estado !== 'pendiente') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden rechazar notas en estado pendiente'
            });
        }

        await notaGasto.update({
            estado: 'rechazada',
            motivoRechazo,
            rechazadoPor,
            fechaAprobacion: new Date()
        });

        res.status(200).json({
            success: true,
            data: notaGasto,
            message: 'Nota de gasto rechazada correctamente'
        });
    } catch (error) {
        console.error('Error al rechazar nota de gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al rechazar la nota de gasto',
            error: error.message
        });
    }
};

/**
 * Eliminar una nota de gasto
 */
exports.eliminarNotaGasto = async (req, res) => {
    try {
        const { id } = req.params;

        const notaGasto = await NotaGasto.findByPk(id);

        if (!notaGasto) {
            return res.status(404).json({
                success: false,
                message: 'Nota de gasto no encontrada'
            });
        }

        // No permitir eliminar notas aprobadas
        if (notaGasto.estado === 'aprobada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden eliminar notas de gasto aprobadas'
            });
        }

        await notaGasto.destroy();

        res.status(200).json({
            success: true,
            message: 'Nota de gasto eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar nota de gasto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la nota de gasto',
            error: error.message
        });
    }
};

/**
 * Subir ticket/factura
 */
exports.subirTicket = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha proporcionado ningún archivo'
            });
        }

        const file = req.file;
        const url = `/uploads/tickets/${file.filename}`;

        res.status(200).json({
            success: true,
            url,
            nombre: file.originalname,
            message: 'Archivo subido correctamente'
        });
    } catch (error) {
        console.error('Error al subir ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir el archivo',
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas de gastos
 */
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const {
            empleado,
            departamento,
            fechaDesde,
            fechaHasta
        } = req.query;

        const where = {};

        if (empleado) {
            where.empleado = empleado;
        }

        if (departamento) {
            where.departamento = departamento;
        }

        if (fechaDesde || fechaHasta) {
            where.fechaSolicitud = {};
            if (fechaDesde) {
                where.fechaSolicitud[Op.gte] = fechaDesde;
            }
            if (fechaHasta) {
                where.fechaSolicitud[Op.lte] = fechaHasta;
            }
        }

        const notas = await NotaGasto.findAll({ where });

        const estadisticas = {
            total: notas.length,
            totalImporte: notas.reduce((sum, nota) => sum + parseFloat(nota.total), 0),
            porEstado: {
                borrador: notas.filter(n => n.estado === 'borrador').length,
                pendiente: notas.filter(n => n.estado === 'pendiente').length,
                aprobada: notas.filter(n => n.estado === 'aprobada').length,
                rechazada: notas.filter(n => n.estado === 'rechazada').length
            },
            importePorEstado: {
                borrador: notas.filter(n => n.estado === 'borrador')
                    .reduce((sum, n) => sum + parseFloat(n.total), 0),
                pendiente: notas.filter(n => n.estado === 'pendiente')
                    .reduce((sum, n) => sum + parseFloat(n.total), 0),
                aprobada: notas.filter(n => n.estado === 'aprobada')
                    .reduce((sum, n) => sum + parseFloat(n.total), 0),
                rechazada: notas.filter(n => n.estado === 'rechazada')
                    .reduce((sum, n) => sum + parseFloat(n.total), 0)
            }
        };

        res.status(200).json({
            success: true,
            data: estadisticas,
            message: 'Estadísticas obtenidas correctamente'
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las estadísticas',
            error: error.message
        });
    }
};