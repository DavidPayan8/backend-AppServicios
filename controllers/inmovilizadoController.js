const db = require("../Model");
const { Op } = require("sequelize");

const obtenerTiposInmovilizado = async (req, res) => {
  try {
    const { empresa } = req.user;
    const tipos = await db.TIPO_INMOVILIZADO.findAll({
      where: { id_origen: empresa },
      attributes: ["id", "Nombre", "codigo"],
      order: [["Nombre", "ASC"]]
    });
    res.status(200).json(tipos);
  } catch (error) {
    console.error("Error al obtener tipos de inmovilizado:", error);
    res.status(500).json({ error: error.message });
  }
};

const obtenerInmovilizados = async (req, res) => {
  try {
    const { empresa, rol } = req.user;
    const { estado } = req.query;

    const { categoria_laboral } = req.user;
    const where = { id_origen: empresa };

    const puedeVerTodos = rol === 'admin' || rol === 'superadmin' ||
      (categoria_laboral && categoria_laboral.toUpperCase() === 'TECNICO');

    if (!puedeVerTodos) {
      where.Estado = 'Alta';
    } else if (estado) {
      where.Estado = estado;
    }

    const inmovilizados = await db.INMOVILIZADO.findAll({
      where,
      include: [
        {
          model: db.TIPO_INMOVILIZADO,
          as: "tipo",
          attributes: ["id", "Nombre", "codigo"]
        }
      ],
      order: [["Fecha_alta", "DESC"]]
    });

    res.status(200).json(inmovilizados);
  } catch (error) {
    console.error("Error al obtener inmovilizados:", error);
    res.status(500).json({ error: error.message });
  }
};

const obtenerUbicacionesInmovilizado = async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.query;

    const where = { Ubicacion: { [Op.ne]: null } };

    if (year) {
      const anio = parseInt(year, 10);
      where.fecha_inicio = {
        [Op.gte]: new Date(`${anio}-01-01T00:00:00.000Z`),
        [Op.lt]: new Date(`${anio + 1}-01-01T00:00:00.000Z`)
      };
    }

    const movimientos = await db.MOVIMIENTOS.findAll({
      include: [
        {
          model: db.MOVIMIENTOS_INMOVILIZADO,
          as: "inmovilizados",
          where: { id_inmovilizado: id },
          attributes: []
        }
      ],
      where,
      attributes: ["id", "fecha_inicio", "fecha_final", "nombreTrabajador", "Ubicacion", "Observaciones"],
      order: [["fecha_inicio", "DESC"]],
      ...(year ? {} : { limit: 10 })
    });

    res.status(200).json(movimientos);
  } catch (error) {
    console.error("Error al obtener ubicaciones del inmovilizado:", error);
    res.status(500).json({ error: error.message });
  }
};

const obtenerMovimientos = async (req, res) => {
  try {
    const { empresa } = req.user;

    const movimientos = await db.MOVIMIENTOS.findAll({
      where: { id_origen: empresa },
      include: [
        {
          model: db.MOVIMIENTOS_INMOVILIZADO,
          as: "inmovilizados",
          attributes: ["id", "id_inmovilizado"],
          include: [
            {
              model: db.INMOVILIZADO,
              as: "inmovilizado",
              attributes: ["id", "descripcion", "Codigo"]
            }
          ]
        }
      ],
      order: [["fecha_inicio", "DESC"]]
    });

    // Mapear para incluir inmovilizado en el nivel superior
    const movimientosConInmovilizado = movimientos.map(m => {
      const data = m.toJSON();
      if (data.inmovilizados && data.inmovilizados.length > 0) {
        data.inmovilizado = data.inmovilizados[0].inmovilizado;
      }
      return data;
    });

    res.status(200).json(movimientosConInmovilizado);
  } catch (error) {
    console.error("Error al obtener movimientos:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const crearMovimiento = async (req, res) => {
  try {
    const { empresa } = req.user;
    let { fecha_inicio, fecha_final, nombreTrabajador, Observaciones, Ubicacion, inmovilizados } = req.body;

    console.log("Body recibido:", req.body);

    if (!fecha_inicio || !nombreTrabajador) {
      return res.status(400).json({ error: "Campos requeridos faltantes: fecha_inicio y nombreTrabajador" });
    }

    const fechaInicio = new Date(fecha_inicio);
    const fechaFinalParsed = (fecha_final && fecha_final !== '') ? new Date(fecha_final) : null;

    if (isNaN(fechaInicio.getTime())) {
      return res.status(400).json({ error: "Formato de fecha_inicio inválido" });
    }

    const ahora = new Date();
    const margenMinutos = 5 * 60 * 1000;
    if (fechaInicio < new Date(ahora.getTime() - margenMinutos)) {
      return res.status(400).json({ error: "No se puede asignar con fecha más de 5 minutos atrás" });
    }

    if (fechaFinalParsed && fechaFinalParsed < fechaInicio) {
      return res.status(400).json({ error: "Fecha final debe ser posterior a fecha inicio" });
    }

    const movimiento = await db.MOVIMIENTOS.create({
      id_origen: empresa,
      fecha_inicio: fechaInicio,
      fecha_final: fechaFinalParsed,
      nombreTrabajador,
      Observaciones,
      Ubicacion,
      estado_traspaso: false
    });

    // Crear relaciones con inmovilizados si se proporcionan
    if (inmovilizados && Array.isArray(inmovilizados)) {
      for (const idInmovilizado of inmovilizados) {
        await db.MOVIMIENTOS_INMOVILIZADO.create({
          id_movimiento: movimiento.id,
          id_inmovilizado: idInmovilizado,
          id_trabajador: req.user.id
        });

        // Actualizar ubicación del inmovilizado con la del movimiento
        if (Ubicacion) {
          const inmovilizado = await db.INMOVILIZADO.findByPk(idInmovilizado);
          if (inmovilizado) {
            await inmovilizado.update({ Ubicacion });
          }
        }
      }
    }

    res.status(201).json(movimiento);
  } catch (error) {
    console.error("Error al crear movimiento:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const actualizarInmovilizado = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estado, Fecha_baja, info_general } = req.body;

    const inmovilizado = await db.INMOVILIZADO.findByPk(id);
    if (!inmovilizado) {
      return res.status(404).json({ error: "Inmovilizado no encontrado" });
    }

    await inmovilizado.update({
      Estado: Estado || inmovilizado.Estado,
      Fecha_baja: Fecha_baja || inmovilizado.Fecha_baja,
      info_general: info_general || inmovilizado.info_general
    });

    res.status(200).json(inmovilizado);
  } catch (error) {
    console.error("Error al actualizar inmovilizado:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const actualizarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    let { fecha_inicio, fecha_final, nombreTrabajador, Observaciones, Ubicacion } = req.body;

    const movimiento = await db.MOVIMIENTOS.findByPk(id);
    if (!movimiento) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }

    if (!movimiento.fecha_final && fecha_inicio) {
      return res.status(400).json({
        error: "No se puede editar fecha_inicio de movimiento abierto"
      });
    }

    const fechaInicioParsed = fecha_inicio ? new Date(fecha_inicio) : null;
    const fechaFinalParsed = (fecha_final && fecha_final !== '') ? new Date(fecha_final) : null;

    const fechaInicioBase = fechaInicioParsed || movimiento.fecha_inicio;
    if (fechaFinalParsed && fechaFinalParsed < new Date(fechaInicioBase)) {
      return res.status(400).json({ error: "Fecha final debe ser posterior a fecha inicio" });
    }

    await movimiento.update({
      fecha_inicio: fechaInicioParsed || movimiento.fecha_inicio,
      fecha_final: fechaFinalParsed !== undefined ? fechaFinalParsed : movimiento.fecha_final,
      nombreTrabajador: nombreTrabajador || movimiento.nombreTrabajador,
      Observaciones: Observaciones !== undefined ? Observaciones : movimiento.Observaciones,
      Ubicacion: Ubicacion !== undefined ? Ubicacion : movimiento.Ubicacion
    });

    res.status(200).json(movimiento);
  } catch (error) {
    console.error("Error al actualizar movimiento:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const crearInmovilizado = async (req, res) => {
  try {
    const { empresa } = req.user;
    const { descripcion, Codigo, Fecha_alta, info_general } = req.body;

    if (!descripcion || !Codigo || !Fecha_alta) {
      return res.status(400).json({ error: "Campos requeridos faltantes" });
    }

    const inmovilizado = await db.INMOVILIZADO.create({
      descripcion,
      Codigo,
      Fecha_alta,
      info_general,
      Estado: 'Alta',
      id_origen: empresa
    });

    res.status(201).json(inmovilizado);
  } catch (error) {
    console.error("Error al crear inmovilizado:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  obtenerTiposInmovilizado,
  obtenerInmovilizados,
  obtenerMovimientos,
  obtenerUbicacionesInmovilizado,
  crearMovimiento,
  actualizarInmovilizado,
  actualizarMovimiento,
  crearInmovilizado
};
