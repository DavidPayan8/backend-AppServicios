const db = require("../Model");
const { Op } = require("sequelize");

const obtenerInmovilizados = async (req, res) => {
  try {
    const { empresa, rol } = req.user;
    const { estado } = req.query;

    const where = { id_origen: empresa };

    // Si no es admin o superadmin, solo mostrar inmovilizados de Alta
    if (rol !== 'admin' && rol !== 'superadmin') {
      where.Estado = 'Alta';
    } else if (estado) {
      // Si es admin, permite filtrar por estado si se especifica
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
    const { fecha_inicio, fecha_final, nombreTrabajador, Observaciones, Ubicacion, inmovilizados } = req.body;

    console.log("Body recibido:", req.body);

    if (!fecha_inicio || !nombreTrabajador) {
      return res.status(400).json({ error: "Campos requeridos faltantes: fecha_inicio y nombreTrabajador" });
    }

    const movimiento = await db.MOVIMIENTOS.create({
      id_origen: empresa,
      fecha_inicio,
      fecha_final,
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
    const { fecha_inicio, fecha_final, nombreTrabajador, Observaciones, Ubicacion } = req.body;

    const movimiento = await db.MOVIMIENTOS.findByPk(id);
    if (!movimiento) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }

    await movimiento.update({
      fecha_inicio: fecha_inicio || movimiento.fecha_inicio,
      fecha_final: fecha_final || movimiento.fecha_final,
      nombreTrabajador: nombreTrabajador || movimiento.nombreTrabajador,
      Observaciones: Observaciones || movimiento.Observaciones,
      Ubicacion: Ubicacion || movimiento.Ubicacion
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
  obtenerInmovilizados,
  obtenerMovimientos,
  crearMovimiento,
  actualizarInmovilizado,
  actualizarMovimiento,
  crearInmovilizado
};
