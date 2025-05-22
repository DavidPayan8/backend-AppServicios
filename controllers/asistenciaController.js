const db = require("../Model");
const { obtenerDireccionReversa } = require("../models/geolocationModel");

// Fichar entrada
const ficharEntradaHandler = async (req, res) => {
  const userId = req.user.id;
  const { date, localizacion_entrada } = req.body;
  let direccionFinal = null;

  const fecha = formatFecha(date);

  try {
    // Verificar parte abierto
    const parteAbierto = await db.CONTROL_ASISTENCIAS.findOne({
      where: { id_usuario: userId, fecha, hora_salida: null },
    });

    if (parteAbierto) {
      return res.status(400).json({
        message: "Ya tienes un parte abierto para fecha. Debes fichar salida.",
      });
    }

    if (localizacion_entrada?.error) {
      // Si viene error, guardamos el mensaje como ubicación
      direccionFinal =
        localizacion_entrada.mensaje || "Ubicación no disponible";
    } else {
      // Si hay coordenadas, hacemos geolocalización inversa
      direccionFinal = await obtenerDireccionReversa(
        localizacion_entrada.lat,
        localizacion_entrada.lng
      );
    }

    // Crear parte con dirección
    const fichaje = await db.CONTROL_ASISTENCIAS.create({
      id_usuario: userId,
      fecha,
      hora_entrada: db.Sequelize.literal("GETDATE()"),
      localizacion_entrada: direccionFinal,
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
  let direccionFinal = null;

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

    if (localizacion_salida?.error) {
      // Si viene error, guardamos el mensaje como ubicación
      direccionFinal = localizacion_salida.mensaje || "Ubicación no disponible";
    } else {
      // Si hay coordenadas, hacemos geolocalización inversa
      direccionFinal = await obtenerDireccionReversa(
        localizacion_salida.lat,
        localizacion_salida.lng
      );
    }

    // Actualizar parte con hora de salida
    parteAbierto.hora_salida = db.Sequelize.literal("GETDATE()");
    parteAbierto.localizacion_salida = direccionFinal;
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
  const { id_parte, localizacion_salida } = req.body;
  let direccionFinal = null;

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

    if (localizacion_salida?.error) {
      // Si viene error, guardamos el mensaje como ubicación
      direccionFinal = localizacion_salida.mensaje || "Ubicación no disponible";
    } else {
      // Si hay coordenadas, hacemos geolocalización inversa
      direccionFinal = await obtenerDireccionReversa(
        localizacion_salida.lat,
        localizacion_salida.lng
      );
    }

    // Actualizar parte con hora de salida
    parteAbierto.hora_salida = db.Sequelize.literal("GETDATE()");
    parteAbierto.localizacion_salida = direccionFinal;
    await parteAbierto.save();

    res.status(200).json(parteAbierto[0]);
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
};
