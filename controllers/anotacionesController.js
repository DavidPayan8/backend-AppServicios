const db = require("../Model");
const { Op, Sequelize } = require("sequelize");
const { format } = require("date-fns");
const { mapAnotacionToCalendarEvent } = require("../utils/maps/anotaciones.js");

const obtenerAnotaciones = async (req, res) => {
  try {
    const { empresa, id } = req.user;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: "Rango requerido" });
    }

    const formattedStart = format(new Date(start), "yyyy-MM-dd HH:mm:ss");
    const formattedEnd = format(new Date(end), "yyyy-MM-dd HH:mm:ss");

    const anotaciones = await db.ANOTACION_AGENDA.findAll({
      where: {
        id_empresa: empresa,
        usuario_id: id,
        fecha_hora_anotacion: {
          [Op.between]: [formattedStart, formattedEnd],
        },
      },
    });

    const eventos = anotaciones.map(mapAnotacionToCalendarEvent);

    res.status(200).json(eventos);
  } catch (error) {
    console.error("Error al obtener lista anotaciones:", error);
    res.status(500).send("Error del servidor");
  }
};

const obtenerNumAnotaciones = async (req, res) => {
  try {
    const { empresa, id } = req.user;

    const total = await db.ANOTACION_AGENDA.count({
      where: {
        id_empresa: empresa,
        usuario_id: id,
        [Op.and]: Sequelize.literal(
          `CAST(fecha_hora_anotacion AS DATE) = CAST(GETDATE() AS DATE)`
        ),
      },
    });

    res.status(200).json({ total });
  } catch (error) {
    console.error("Error al obtener número de anotaciones:", error);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  obtenerAnotaciones,
  obtenerNumAnotaciones,
};
