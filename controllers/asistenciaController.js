const db = require("../Model");

// Fichar entrada
const ficharEntradaHandler = async (req, res) => {
  const userId = req.user.id;
  const { date, localizacion_entrada } = req.body;

  const fecha = formatFecha(date);

  try {
    // Verificar si ya hay un parte abierto para el usuario en esa fecha
    const parteAbierto = await db.CONTROL_ASISTENCIAS.findOne({
      where: {
        id_usuario: userId,
        fecha,
        hora_salida: null,
      },
    });

    if (parteAbierto) {
      return res.status(400).json({
        message: "Ya tienes un parte abierto para hoy. Debes fichar salida.",
      });
    }

    // Crear nuevo parte de entrada
    const fichaje = await db.CONTROL_ASISTENCIAS.create({
      id_usuario: userId,
      fecha,
      hora_entrada: db.Sequelize.literal("GETDATE()"),
      localizacion_entrada,
    });

    res.status(201).json(fichaje);
  } catch (error) {
    console.error("Error al fichar entrada:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

// Fichar salida
const ficharSalidaHandler = async (req, res) => {
  const userId = req.user.id;
  const { date, localizacion_salida } = req.body;

  try {
    const fecha = formatFecha(date);

    // Verificar si hay un parte abierto para el usuario en esa fecha
    const parteAbierto = await db.CONTROL_ASISTENCIAS.findOne({
      where: {
        id_usuario: userId,
        fecha: fecha,
        hora_salida: null,
      },
    });

    if (!parteAbierto) {
      return res.status(400).json({
        message:
          "No tienes un parte abierto para hoy. Debes fichar entrada primero.",
      });
    }

    // Actualizar parte con hora de salida
    parteAbierto.hora_salida = db.Sequelize.literal("GETDATE()");
    parteAbierto.localizacion_salida = localizacion_salida;
    await parteAbierto.save();

    res.status(200).json(parteAbierto[0]);
  } catch (error) {
    console.error("Error al fichar salida:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

// Obtener partes de asistencia del usuario para una fecha
const obtenerPartesUsuarioFecha = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;

  const fecha = new Date(formatFecha(date));

  try {
    // Buscar partes de asistencia para el usuario y la fecha
    const partesUsuario = await db.CONTROL_ASISTENCIAS.findAll({
      where: {
        id_usuario: userId,
        fecha,
      },
      order: [["fecha", "ASC"]],
    });

    res.status(200).json(partesUsuario);
  } catch (error) {
    console.error("Error al obtener los partes del usuario:", error.message);
    res.status(500).json({
      message: "Error del servidor al obtener los partes del usuario.",
    });
  }
};

// Función para formatear la fecha en 'YYYY-MM-DD', recibiendo dd/mm/yyyy
const formatFecha = (fecha) => {
  const [dia, mes, anio] = fecha.split("/");
  return `${anio}-${mes}-${dia}`;
};

module.exports = {
  ficharEntradaHandler,
  ficharSalidaHandler,
  obtenerPartesUsuarioFecha,
};
