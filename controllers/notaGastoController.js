const { NotaGasto, ORDEN_TRABAJO } = require("../Model");
const { Op } = require("sequelize");
const { paginatedResponse } = require("../resources/helpers/paginator");
const {
  generarUrlTemporalAzureByPath,
  eliminarArchivoAzureByPath,
} = require("../Model/others/blobStorageModel");
const mime = require("mime-types");
const path = require("path");

/**
 * Obtener todas las notas de gasto con filtros y paginación
 */
exports.obtenerNotasGasto = async (req, res) => {
  try {
    const { estado, empleado, departamento, fechaDesde, fechaHasta } =
      req.query;

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
          as: "proyecto_rel",
          attributes: ["nombre"],
        },
      ],
    });

    // Si quisieras añadir estadísticas agregadas opcionales
    const totalStats = {
      totalImporte: rows.reduce((acc, nota) => acc + (nota.importe || 0), 0),
    };

    const data = await Promise.all(
      rows.map(async (nota) => {
        const notaJson = nota.toJSON();
        notaJson.lineasGasto = await processLinesWithSasUrl(
          notaJson.lineasGasto
        );
        return {
          ...notaJson,
          nombre_proyecto: nota.proyecto_rel ? nota.proyecto_rel.nombre : null,
        };
      })
    );

    const response = paginatedResponse(
      data,
      count,
      parseInt(page),
      limit,
      totalStats
    );

    res.status(200).json({
      success: true,
      ...response,
      message: "Notas de gasto obtenidas correctamente",
    });
  } catch (error) {
    console.error("Error al obtener notas de gasto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las notas de gasto",
      error: error.message,
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
        message: "Nota de gasto no encontrada",
      });
    }

    const notaJson = notaGasto.toJSON();
    notaJson.lineasGasto = await processLinesWithSasUrl(notaJson.lineasGasto);

    res.status(200).json({
      success: true,
      data: notaJson,
      message: "Nota de gasto obtenida correctamente",
    });
  } catch (error) {
    console.error("Error al obtener nota de gasto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la nota de gasto",
      error: error.message,
    });
  }
};

const generateSasUrlForLinea = async (linea) => {
  const newLinea = { ...linea };

  let blobPath = null;

  // Priorizamos 'ticket' que puede ser array (del upload) o string
  if (newLinea.ticket) {
    if (Array.isArray(newLinea.ticket) && newLinea.ticket.length > 0) {
      blobPath = newLinea.ticket[0];
    } else if (typeof newLinea.ticket === "string") {
      blobPath = newLinea.ticket;
    } else if (typeof newLinea.ticket === "object" && newLinea.ticket.url) {
      // Ya procesado o formato objeto? Usamos url    si existe
      blobPath = newLinea.ticket.url;
    }
  }

  // Fallback a 'url' si no hay path válido en ticket
  if (!blobPath && newLinea.url && typeof newLinea.url === "string") {
    blobPath = newLinea.url;
  }

  // Verificamos si tiene una URL que parece estar en Azure Blob Storage (contiene DB_NAME)
  if (
    blobPath &&
    typeof blobPath === "string" &&
    blobPath.includes(process.env.DB_NAME)
  ) {
    try {
      // Generar SAS con 24 horas (1440 min) de validez
      const sasUrl = await generarUrlTemporalAzureByPath(blobPath, 1440);

      const nombreArchivo = path.basename(blobPath);
      const tipoArchivo =
        mime.lookup(nombreArchivo) || "application/octet-stream";

      newLinea.ticket = {
        url: sasUrl,
        backendUrl: blobPath,
        nombre: nombreArchivo,
        tipo: tipoArchivo,
      };
    } catch (err) {
      console.error("Error generando SAS URL para línea de gasto:", err);
      // En caso de error, podríamos mandar ticket con null o parcialmente relleno
      newLinea.ticket = null;
    }
  }
  return newLinea;
};

const processLinesWithSasUrl = async (lineasGasto) => {
  if (!lineasGasto || !Array.isArray(lineasGasto)) return [];
  return await Promise.all(lineasGasto.map(generateSasUrlForLinea));
};

const normalizeLineasGasto = (lineasGasto) => {
  if (!lineasGasto || !Array.isArray(lineasGasto)) return [];

  return lineasGasto.map((linea) => {
    const newLinea = { ...linea };
    // Si ticket existe, normalizar a string
    if (newLinea.ticket) {
      if (Array.isArray(newLinea.ticket)) {
        // Si es array, quedarnos con el primero
        newLinea.ticket =
          newLinea.ticket.length > 0 ? newLinea.ticket[0] : null;
      } else if (typeof newLinea.ticket === "object") {
        // Si es objeto (del preview), intentar sacar backendUrl, fallback a url
        newLinea.ticket =
          newLinea.ticket.backendUrl || newLinea.ticket.url || null;
      }
      // Si es string, se queda igual
    }
    return newLinea;
  });
};

/**
 * Crear una nueva nota de gasto
 */
exports.crearNotaGasto = async (req, res) => {
  try {
    let notaGastoData = req.body;

    notaGastoData = {
      ...notaGastoData,
      empleado: req.user.id,
      id_empresa: req.user.empresa,
    };

    if (notaGastoData.lineasGasto) {
      notaGastoData.lineasGasto = normalizeLineasGasto(
        notaGastoData.lineasGasto
      );
    }

    console.log(notaGastoData);

    // Crear instancia temporal para validar
    const notaGastoTemp = NotaGasto.build(notaGastoData);
    const erroresValidacion = notaGastoTemp.validarLineasGasto();

    if (erroresValidacion.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Errores de validación",
        errors: erroresValidacion,
      });
    }

    // Crear la nota de gasto
    const notaGasto = await NotaGasto.create(notaGastoData);

    res.status(201).json({
      success: true,
      data: notaGasto,
      message: "Nota de gasto creada correctamente",
    });
  } catch (error) {
    console.error("Error al crear nota de gasto:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la nota de gasto",
      error: error.message,
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

    datosActualizacion.empleado = req.user.id;
    datosActualizacion.id_empresa = req.user.empresa;

    if (!notaGasto) {
      return res.status(404).json({
        success: false,
        message: "Nota de gasto no encontrada",
      });
    }

    // No permitir editar si ya está aprobada
    if (notaGasto.estado === "aprobada") {
      return res.status(400).json({
        success: false,
        message: "No se puede editar una nota de gasto aprobada",
      });
    }

    // Validar líneas de gasto si se están actualizando
    if (datosActualizacion.lineasGasto) {
      // Normalizar antes de validar/guardar
      datosActualizacion.lineasGasto = normalizeLineasGasto(
        datosActualizacion.lineasGasto
      );

      const notaGastoTemp = NotaGasto.build({
        ...notaGasto.toJSON(),
        ...datosActualizacion,
      });
      const erroresValidacion = notaGastoTemp.validarLineasGasto();

      if (erroresValidacion.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: erroresValidacion,
        });
      }
    }

    await notaGasto.update(datosActualizacion);

    res.status(200).json({
      success: true,
      data: notaGasto,
      message: "Nota de gasto actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar nota de gasto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la nota de gasto",
      error: error.message,
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

    notaGastoData.empleado = req.user.id;
    notaGastoData.id_empresa = req.user.empresa;

    let notaGasto;

    // Si tiene ID, actualizar existente, si no, crear nueva
    if (id && id !== "undefined") {
      notaGasto = await NotaGasto.findByPk(id);

      if (!notaGasto) {
        return res.status(404).json({
          success: false,
          message: "Nota de gasto no encontrada",
        });
      }

      if (notaGasto.estado === "aprobada") {
        return res.status(400).json({
          success: false,
          message: "No se puede enviar una nota ya aprobada",
        });
      }

      await notaGasto.update({
        ...notaGastoData,
        estado: "pendiente",
      });
    } else {
      // Crear nueva nota directamente en estado pendiente
      notaGasto = await NotaGasto.create({
        ...notaGastoData,
        estado: "pendiente",
      });
    }

    res.status(200).json({
      success: true,
      data: notaGasto,
      message: "Nota de gasto enviada para aprobación correctamente",
    });
  } catch (error) {
    console.error("Error al enviar nota de gasto:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar la nota de gasto",
      error: error.message,
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
        message: "El campo aprobadoPor es obligatorio",
      });
    }

    const notaGasto = await NotaGasto.findByPk(id);

    if (!notaGasto) {
      return res.status(404).json({
        success: false,
        message: "Nota de gasto no encontrada",
      });
    }

    if (notaGasto.estado !== "pendiente") {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden aprobar notas en estado pendiente",
      });
    }

    await notaGasto.update({
      estado: "aprobada",
      aprobadoPor,
      fechaAprobacion: new Date(),
      observaciones: comentarios || notaGasto.observaciones,
    });

    res.status(200).json({
      success: true,
      data: notaGasto,
      message: "Nota de gasto aprobada correctamente",
    });
  } catch (error) {
    console.error("Error al aprobar nota de gasto:", error);
    res.status(500).json({
      success: false,
      message: "Error al aprobar la nota de gasto",
      error: error.message,
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
        message: "El motivo de rechazo y rechazadoPor son obligatorios",
      });
    }

    const notaGasto = await NotaGasto.findByPk(id);

    if (!notaGasto) {
      return res.status(404).json({
        success: false,
        message: "Nota de gasto no encontrada",
      });
    }

    if (notaGasto.estado !== "pendiente") {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden rechazar notas en estado pendiente",
      });
    }

    await notaGasto.update({
      estado: "rechazada",
      motivoRechazo,
      rechazadoPor,
      fechaAprobacion: new Date(),
    });

    res.status(200).json({
      success: true,
      data: notaGasto,
      message: "Nota de gasto rechazada correctamente",
    });
  } catch (error) {
    console.error("Error al rechazar nota de gasto:", error);
    res.status(500).json({
      success: false,
      message: "Error al rechazar la nota de gasto",
      error: error.message,
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
        message: "Nota de gasto no encontrada",
      });
    }

    // No permitir eliminar notas aprobadas
    if (notaGasto.estado === "aprobada") {
      return res.status(400).json({
        success: false,
        message: "No se pueden eliminar notas de gasto aprobadas",
      });
    }

    await notaGasto.destroy();

    res.status(200).json({
      success: true,
      message: "Nota de gasto eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar nota de gasto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la nota de gasto",
      error: error.message,
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
        message: "No se ha proporcionado ningún archivo",
      });
    }

    const file = req.file;
    const url = `/uploads/tickets/${file.filename}`;

    res.status(200).json({
      success: true,
      url,
      nombre: file.originalname,
      message: "Archivo subido correctamente",
    });
  } catch (error) {
    console.error("Error al subir ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error al subir el archivo",
      error: error.message,
    });
  }
};

/**
 * Obtener estadísticas de gastos
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const { empleado, departamento, fechaDesde, fechaHasta } = req.query;

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
      totalImporte: notas.reduce(
        (sum, nota) => sum + parseFloat(nota.total),
        0
      ),
      porEstado: {
        borrador: notas.filter((n) => n.estado === "borrador").length,
        pendiente: notas.filter((n) => n.estado === "pendiente").length,
        aprobada: notas.filter((n) => n.estado === "aprobada").length,
        rechazada: notas.filter((n) => n.estado === "rechazada").length,
      },
      importePorEstado: {
        borrador: notas
          .filter((n) => n.estado === "borrador")
          .reduce((sum, n) => sum + parseFloat(n.total), 0),
        pendiente: notas
          .filter((n) => n.estado === "pendiente")
          .reduce((sum, n) => sum + parseFloat(n.total), 0),
        aprobada: notas
          .filter((n) => n.estado === "aprobada")
          .reduce((sum, n) => sum + parseFloat(n.total), 0),
        rechazada: notas
          .filter((n) => n.estado === "rechazada")
          .reduce((sum, n) => sum + parseFloat(n.total), 0),
      },
    };

    res.status(200).json({
      success: true,
      data: estadisticas,
      message: "Estadísticas obtenidas correctamente",
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las estadísticas",
      error: error.message,
    });
  }
};

/**
 * Eliminar ticket de gasto
 */
exports.eliminarTicketGasto = async (req, res) => {
  try {
    const { url, idNotaGasto } = req.body;

    const id_notaGasto = Number(idNotaGasto);

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Se requiere url   del ticket a eliminar",
      });
    }

    // 1. Validar ID y Estado si existe la nota
    let nota = null;

    if (id_notaGasto) {
      nota = await NotaGasto.findByPk(id_notaGasto);

      if (nota) {
        // Validación de estado: Solo borrador
        if (nota.estado !== "borrador") {
          return res.status(400).json({
            success: false,
            message:
              "Solo se pueden eliminar tickets de notas en estado borrador",
          });
        }
      } else {
        console.warn(
          `No se encontró NotaGasto con ID ${id_notaGasto} para validar estado.`
        );
        // Si no se encuentra, podriamos permitir borrar el archivo huerfano?
        // Asumiremos que si el ID fue enviado, la intencion era borrar de ESA nota.
      }
    }

    // 2. Eliminar archivo de Azure (Solo si pasamos validación)
    try {
      if (typeof url === "string") {
        await eliminarArchivoAzureByPath(url);
      } else {
        console.error("Backend URL no es string:", url);
      }
    } catch (azureErr) {
      console.error("Error al eliminar archivo de Azure:", azureErr);
    }

    // 3. Actualizar la BD si tenemos la nota
    if (nota) {
      let lineas = nota.lineasGasto || [];
      let modified = false;

      // Buscamos la línea que tenga este ticket y se lo quitamos
      lineas = lineas.map((linea) => {
        // Recuperamos el path del ticket (backendUrl es la clave fiable si existe)
        let ticketPath = null;
        if (linea.ticket) {
          if (linea.ticket.backendUrl) ticketPath = linea.ticket.backendUrl;
          else if (linea.ticket.url)
            ticketPath = linea.ticket.url; // legacy or incorrect field
          else if (typeof linea.ticket === "string") ticketPath = linea.ticket;
        } else if (linea.url) {
          ticketPath = linea.url;
        }
        if (
          ticketPath === url ||
          (Array.isArray(linea.ticket) && linea.ticket.includes(url))
        ) {
          modified = true;
          // Opción: Poner ticket a null
          linea.ticket = null;

          // Limpiar url legacy también si coincide
          if (linea.url === url) {
            linea.url = null;
          }
        }
        return linea;
      });

      if (modified) {
        nota.setDataValue("lineasGasto", lineas);
        nota.changed("lineasGasto", true);
        await nota.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Ticket eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar ticket de gasto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el ticket",
      error: error.message,
    });
  }
};
