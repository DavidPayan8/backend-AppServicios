const db = require("../Model");
const { HorasExtra } = db;
const { Op } = require("sequelize");
const { paginatedResponse } = require("../resources/helpers/paginator");

/**
 * Calcular duración en minutos entre dos horas (HH:mm)
 */
const calcularDuracion = (horaInicio, horaFin) => {
  const [inicioH, inicioM] = horaInicio.split(':').map(Number);
  const [finH, finM] = horaFin.split(':').map(Number);

  let inicioMinutos = inicioH * 60 + inicioM;
  let finMinutos = finH * 60 + finM;

  // Si la hora fin es menor que la hora inicio, asumir que es del día siguiente
  if (finMinutos < inicioMinutos) {
    finMinutos += 24 * 60;
  }

  return finMinutos - inicioMinutos;
};

/**
 * Obtener todas las horas extra del empleado autenticado con paginación
 */
exports.obtenerHorasExtra = async (req, res) => {
  try {
    console.log("obtenerHorasExtra - req.user.id:", req.user?.id);
    console.log("obtenerHorasExtra - db.HorasExtra:", db.HorasExtra ? "EXISTS" : "UNDEFINED");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {
      empleado: req.user.id
    };

    // Filtro opcional por fecha
    if (req.query.fechaDesde || req.query.fechaHasta) {
      where.fecha = {};
      if (req.query.fechaDesde) {
        where.fecha[Op.gte] = req.query.fechaDesde;
      }
      if (req.query.fechaHasta) {
        where.fecha[Op.lte] = req.query.fechaHasta;
      }
    }

    // Ejecutar consulta con paginación
    const { count, rows } = await HorasExtra.findAndCountAll({
      where,
      limit,
      offset,
      order: [["fecha", "DESC"], ["fechaCreacion", "DESC"]],
    });

    const response = paginatedResponse(
      rows,
      count,
      parseInt(page),
      limit
    );

    res.status(200).json({
      success: true,
      ...response,
      message: "Horas extra obtenidas correctamente"
    });
  } catch (error) {
    console.error("Error al obtener horas extra:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las horas extra",
      error: error.message
    });
  }
};

/**
 * Crear una nueva entrada de horas extra
 */
exports.crearHoraExtra = async (req, res) => {
  try {
    const { fecha, horaInicio, horaFin, descripcion } = req.body;

    // Validaciones básicas
    if (!fecha || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        message: "Fecha, hora inicio y hora fin son requeridas"
      });
    }

    const duracionMinutos = calcularDuracion(horaInicio, horaFin);

    // Validar que no exista registro con misma fecha y misma hora de inicio
    const duplicado = await HorasExtra.findOne({
      where: {
        empleado: req.user.id,
        fecha,
        horaInicio
      }
    });

    if (duplicado) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un registro que comienza a esa hora en esa fecha"
      });
    }

    const horaExtraData = {
      empleado: req.user.id,
      id_empresa: req.user.empresa,
      fecha,
      horaInicio,
      horaFin,
      descripcion: descripcion || null,
      duracionMinutos
    };

    const horaExtra = await HorasExtra.create(horaExtraData);

    res.status(201).json({
      success: true,
      data: horaExtra,
      message: "Hora extra registrada correctamente"
    });
  } catch (error) {
    console.error("Error al crear hora extra:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la hora extra",
      error: error.message
    });
  }
};

/**
 * Obtener una hora extra por ID
 */
exports.obtenerHoraExtraPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const horaExtra = await HorasExtra.findByPk(id);

    if (!horaExtra) {
      return res.status(404).json({
        success: false,
        message: "Hora extra no encontrada"
      });
    }

    // Verificar que pertenece al empleado autenticado
    if (horaExtra.empleado !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para ver esta hora extra"
      });
    }

    res.status(200).json({
      success: true,
      data: horaExtra,
      message: "Hora extra obtenida correctamente"
    });
  } catch (error) {
    console.error("Error al obtener hora extra:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la hora extra",
      error: error.message
    });
  }
};

/**
 * Actualizar una hora extra
 */
exports.actualizarHoraExtra = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, horaInicio, horaFin, descripcion } = req.body;

    const horaExtra = await HorasExtra.findByPk(id);

    if (!horaExtra) {
      return res.status(404).json({
        success: false,
        message: "Hora extra no encontrada"
      });
    }

    // Verificar que pertenece al empleado autenticado
    if (horaExtra.empleado !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar esta hora extra"
      });
    }


    const updateData = {};
    if (fecha) updateData.fecha = fecha;
    if (horaInicio) updateData.horaInicio = horaInicio;
    if (horaFin) updateData.horaFin = horaFin;
    if (descripcion !== undefined) updateData.descripcion = descripcion;

    // Recalcular duración si cambió hora inicio o fin
    if (horaInicio || horaFin) {
      const inicio = horaInicio || horaExtra.horaInicio;
      const fin = horaFin || horaExtra.horaFin;
      updateData.duracionMinutos = calcularDuracion(inicio, fin);
    }

    await horaExtra.update(updateData);

    res.status(200).json({
      success: true,
      data: horaExtra,
      message: "Hora extra actualizada correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar hora extra:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la hora extra",
      error: error.message
    });
  }
};

/**
 * Eliminar una hora extra
 */
exports.eliminarHoraExtra = async (req, res) => {
  try {
    const { id } = req.params;

    const horaExtra = await HorasExtra.findByPk(id);

    if (!horaExtra) {
      return res.status(404).json({
        success: false,
        message: "Hora extra no encontrada"
      });
    }

    // Verificar que pertenece al empleado autenticado
    if (horaExtra.empleado !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para eliminar esta hora extra"
      });
    }

    await horaExtra.destroy();

    res.status(200).json({
      success: true,
      message: "Hora extra eliminada correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar hora extra:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la hora extra",
      error: error.message
    });
  }
};
