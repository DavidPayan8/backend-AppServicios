const db = require("../Model");
const { obtenerDireccionReversa } = require("../Model/others/geolocationModel");

// Fichar entrada
const ficharEntradaHandler = async (req, res) => {
  const userId = req.user.id;
  const { canClockIn } = req.user;
  const { date } = req.body;
  const fecha = formatFecha(date);

  if (canClockIn === false) {
    return res
      .status(403)
      .json({ message: "Permiso para fichar desactivado." });
  }

  try {
    // Verificar parte abierto
    const parteAbierto = await db.CONTROL_ASISTENCIAS.findOne({
      where: { id_usuario: userId, fecha, hora_salida: null },
    });

    if (parteAbierto) {
      return res.status(400).json({
        message:
          "Ya tienes un parte abierto para esta fecha. Debes fichar salida.",
      });
    }

    // Crear parte sin localización (se actualiza luego)
    const fichaje = await db.CONTROL_ASISTENCIAS.create({
      id_usuario: userId,
      fecha,
      hora_entrada: db.Sequelize.literal("GETDATE()"),
    });

    // Responder inmediatamente con el ID del fichaje
    res.status(201).json({ id: fichaje.id });
  } catch (error) {
    console.error("Error al fichar entrada:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

// Fichar salida
const ficharSalidaHandler = async (req, res) => {
  const userId = req.user.id;
  const { canClockIn } = req.user;
  const { date } = req.body;

  if (canClockIn === false) {
    return res
      .status(403)
      .json({ message: "Permiso para fichar desactivado." });
  }

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
          "No tienes un parte abierto para fecha. Debes fichar entrada primero.",
      });
    }

    // Actualizar parte con hora de salida
    parteAbierto.hora_salida = db.Sequelize.literal("GETDATE()");
    await parteAbierto.save();

    res.status(200).json({ id: parteAbierto.id });
  } catch (error) {
    console.error("Error al fichar salida:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

const actualizarLocalizacionEntrada = async (req, res) => {
  const { id_parte, localizacion_entrada } = req.body;

  let direccionFinal = "Ubicación no disponible";

  try {
    if (!id_parte) return res.status(400).json({ message: "Id requerido." });

    if (localizacion_entrada?.error) {
      direccionFinal =
        localizacion_entrada.mensaje || "Ubicación no disponible";
    } else {
      try {
        direccionFinal = await obtenerDireccionReversa(
          localizacion_entrada.lat,
          localizacion_entrada.lng
        );
      } catch (err) {
        console.error("Error al obtener dirección:", err);
      }
    }

    // Actualizar localización
    await db.CONTROL_ASISTENCIAS.update(
      { localizacion_entrada: direccionFinal },
      { where: { id: id_parte } }
    );

    res
      .status(200)
      .json({ message: "Localización actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar localización:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

const actualizarLocalizacionSalida = async (req, res) => {
  const { id_parte, localizacion_salida } = req.body;

  let direccionFinal = "Ubicación no disponible";

  try {
    if (!id_parte) return res.status(400).json({ message: "Id requerido." });

    if (localizacion_salida?.error) {
      direccionFinal = localizacion_salida.mensaje || "Ubicación no disponible";
    } else {
      try {
        direccionFinal = await obtenerDireccionReversa(
          localizacion_salida.lat,
          localizacion_salida.lng
        );
      } catch (err) {
        console.error("Error al obtener dirección:", err);
      }
    }

    // Actualizar localización
    await db.CONTROL_ASISTENCIAS.update(
      { localizacion_salida: direccionFinal },
      { where: { id: id_parte } }
    );

    res
      .status(200)
      .json({ message: "Localización actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar localización:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

// Obtener partes de asistencia del usuario para una fecha
const obtenerPartesUsuarioFecha = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;

  const fecha = new Date(formatFecha(date));
  const ayer = new Date(fecha);
  ayer.setDate(fecha.getDate() - 1);

  try {
    // Buscar partes del usuario para fecha
    const partesfecha = await db.CONTROL_ASISTENCIAS.findAll({
      where: {
        id_usuario: userId,
        fecha,
      },
      order: [["hora_entrada", "ASC"]],
      raw: true, // para obtener objetos planos
    });

    const partesConHoras = partesfecha.map((parte) => {
      if (parte.hora_entrada && parte.hora_salida) {
        const entrada = new Date(parte.hora_entrada);
        const salida = new Date(parte.hora_salida);

        if (
          !isNaN(entrada.getTime()) &&
          !isNaN(salida.getTime()) &&
          salida > entrada
        ) {
          const diffMin = Math.floor((salida - entrada) / 60000);
          const horas = String(Math.floor(diffMin / 60)).padStart(2, "0");
          const minutos = String(diffMin % 60).padStart(2, "0");
          parte.horas = `${horas}:${minutos}`;
        } else {
          parte.horas = "00:00";
        }
      } else {
        parte.horas = "00:00";
      }

      return parte;
    });

    // Buscar partes del usuario para ayer sin salida
    const partesAyerSinSalida = await db.CONTROL_ASISTENCIAS.findOne({
      where: {
        id_usuario: userId,
        fecha: ayer,
        hora_salida: null,
      },
      order: [["hora_entrada", "ASC"]],
    });

    res.status(200).json({
      hoy: partesConHoras,
      ayer: partesAyerSinSalida,
    });
  } catch (error) {
    console.error("Error al obtener los partes del usuario:", error.message);
    res.status(500).json({
      message: "Error del servidor al obtener los partes del usuario.",
    });
  }
};

const cerrarParteAbierto = async (req, res) => {
  const userId = req.user.id;
  const { id_parte } = req.body;

  try {
    // Verificar si hay un parte abierto para el usuario en esa fecha
    const parteAbierto = await db.CONTROL_ASISTENCIAS.findOne({
      where: {
        id: id_parte,
        id_usuario: userId,
        hora_salida: null,
      },
    });

    if (!parteAbierto) {
      return res.status(400).json({
        message: "No tienes un parte abierto. Debes fichar entrada primero.",
      });
    }

    // Actualizar parte con hora de salida
    parteAbierto.hora_salida = db.Sequelize.literal("GETDATE()");
    await parteAbierto.save();

    res.status(200).json(parteAbierto.id);
  } catch (error) {
    console.error("Error al fichar salida:", error);
    res.status(500).json({ message: "Error del servidor." });
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
  cerrarParteAbierto,
  actualizarLocalizacionEntrada,
  actualizarLocalizacionSalida,
};
