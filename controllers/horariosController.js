// controllers/horarios.controller.js
const db = require("../Model");
const { validarTramos } = require("../utils/horarios");
const { mapJornada } = require("../resources/horarios");

const getJornadas = async (req, res) => {
  try {
    const jornadas = await db.HORARIOS_PLANTILLA.findAll({
      include: {
        model: db.HORARIOS_TRAMOS,
        as: 'tramos',
        include: { model: db.HORARIOS_DETALLE_DIA, as: 'detallesDias' }
      },
      where: { id_empresa: req.user.empresa }
    });

    const result = jornadas.map(mapJornada);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getJornadaById = async (req, res) => {
  try {
    const jornada = await db.HORARIOS_PLANTILLA.findByPk(req.params.id, {
      include: {
        model: db.HORARIOS_TRAMOS,
        as: 'tramos',
        include: { model: db.HORARIOS_DETALLE_DIA, as: 'detallesDias' }
      }
    });

    if (!jornada) return res.status(404).json({ message: 'Jornada no encontrada' });

    const result = mapJornada(jornada);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const createJornada = async (req, res) => {
  try {
    const id_empresa = req.user.empresa;
    const { nombre, descripcion, activo, fecha_inicio, fecha_fin, tramos } = req.body;

    const check = validarTramos(tramos);
    if (!check.valido) {
      return res.status(400).json({ message: check.error });
    }

    const jornada = await db.sequelize.transaction(async (t) => {
      const jornada = await db.HORARIOS_PLANTILLA.create({
        nombre, descripcion, id_empresa, activo, fecha_inicio, fecha_fin: fecha_fin || null
      }, { transaction: t });

      if (tramos?.length) {
        for (const tramo of tramos) {
          const newTramo = await db.HORARIOS_TRAMOS.create({
            id_horario: jornada.id_horario,
            hora_inicio: tramo.hora_inicio,
            hora_fin: tramo.hora_fin,
            descripcion: tramo.descripcion
          }, { transaction: t });

          if (tramo.dias?.length) {
            for (const dia of tramo.dias) {
              await db.HORARIOS_DETALLE_DIA.create({
                id_tramo: newTramo.id_tramo,
                dia_semana: dia
              }, { transaction: t });
            }
          }
        }
      }

      return jornada;
    });

    res.status(201).json(jornada);
  } catch (error) {
    console.error("Error en createJornada:", error);
    res.status(500).json({ message: error.message });
  }
};


const updateJornada = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { nombre, descripcion, id_empresa, activo, fecha_inicio, fecha_fin, tramos } = req.body;

    const check = validarTramos(tramos);
    if (!check.valido) {
      await t.rollback();
      return res.status(400).json({ message: check.error });
    }

    const jornada = await db.HORARIOS_PLANTILLA.findByPk(id);
    if (!jornada) return res.status(404).json({ message: 'Jornada no encontrada' });

    await jornada.update({ nombre, descripcion, id_empresa, activo, fecha_inicio, fecha_fin }, { transaction: t });

    // Resetear tramos previos
    await db.HORARIOS_TRAMOS.destroy({ where: { id_horario: id }, transaction: t });

    if (tramos?.length) {
      for (const tramo of tramos) {
        const newTramo = await db.HORARIOS_TRAMOS.create({
          id_horario: jornada.id_horario,
          hora_inicio: tramo.hora_inicio,
          hora_fin: tramo.hora_fin,
          descripcion: tramo.descripcion
        }, { transaction: t });

        if (tramo.dias?.length) {
          for (const dia of tramo.dias) {
            await db.HORARIOS_DETALLE_DIA.create({
              id_tramo: newTramo.id_tramo,
              dia_semana: dia
            }, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    res.status(201).json(jornada);
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteJornada = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    await db.HORARIOS_TRAMOS.destroy({ where: { id_horario: id }, transaction: t });

    const deleted = await db.HORARIOS_PLANTILLA.destroy({ where: { id_horario: id }, transaction: t });

    if (!deleted) {
      await t.rollback();
      return res.status(404).json({ message: 'Jornada no encontrada' })
    };

    await t.commit();
    res.status(200).json({ message: 'Jornada eliminada con éxito' });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getJornadas,
  getJornadaById,
  createJornada,
  updateJornada,
  deleteJornada
}
