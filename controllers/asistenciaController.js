const db = require("../Model");
const { obtenerDireccionReversa } = require("../Model/others/geolocationModel");

// devMike: devuelve la hora actual en la timezone de la empresa como string HH:MM:SS (compatible con columna TIME de SQL Server)
const getNowForEmpresa = (timezone) => {
  const tz = timezone || "Europe/Madrid";
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map(({ type, value }) => [type, value])
  );
  const result = `${parts.hour}:${parts.minute}:${parts.second}`;
  console.log("[getNowForEmpresa] tz:", tz, "-> hora calculada:", result, "| UTC actual:", new Date().toISOString());
  return result;
};

// Helper para verificar parte_auto y timezone de empresa
const getConfigEmpresa = async (empresaId) => {
  const configEmpresa = await db.CONFIG_EMPRESA.findOne({
    where: { id_empresa: empresaId },
    attributes: ["parte_auto", "timezone"], //timezone afecta a la hora de fichar
  });
  console.log("[getConfigEmpresa] empresaId:", empresaId, "-> timezone en BD:", configEmpresa?.timezone);
  return {
    isParteAuto: configEmpresa?.parte_auto || false,
    timezone: configEmpresa?.timezone || "Europe/Madrid",
  };
};

// Verificar tiempo mínimo entre fichajes (debounce)
const checkMinTimeFichaje = async (userId) => {
  try {
    // Verificamos solo registros del mismo día para evitar bloqueo si se ficha a la misma hora en días distintos
    const lastFichaje = await db.sequelize.query(
      `SELECT TOP 1 
        fecha,
        CASE 
          WHEN hora_salida IS NOT NULL THEN DATEDIFF(SECOND, CAST(hora_salida AS TIME), CAST(GETDATE() AS TIME))
          ELSE DATEDIFF(SECOND, CAST(hora_entrada AS TIME), CAST(GETDATE() AS TIME))
        END as seconds_diff
       FROM CONTROL_ASISTENCIAS 
       WHERE id_usuario = :userId 
       AND fecha = CONVERT(date, GETDATE())
       ORDER BY id DESC`,
      {
        replacements: { userId },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (lastFichaje && lastFichaje.length > 0) {
      const { seconds_diff } = lastFichaje[0];

      if (seconds_diff >= 0 && seconds_diff < 10) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error al verificar tiempo mínimo:", error);
    // En caso de error, permitimos fichar para no bloquear, o registramos
    return true;
  }
};

// Fichar entrada
const ficharEntradaHandler = async (req, res) => {
  const userId = req.user.id;
  const { canClockIn, empresa: empresaId } = req.user;
  const { date, proyectoId } = req.body;
  const fecha = formatFecha(date);

  if (canClockIn === false) {
    return res
      .status(403)
      .json({ message: "Permiso para fichar desactivado." });
  }

  // Verificar tiempo mínimo (anti-doble click)
  const isTimeValid = await checkMinTimeFichaje(userId);
  if (!isTimeValid) {
    return res.status(429).json({
      message: "Por favor, espera unos segundos antes de volver a fichar.",
    });
  }

  const t = await db.sequelize.transaction();

  try {
    // Verificar parte abierto
    const parteAbierto = await db.CONTROL_ASISTENCIAS.findOne({
      where: { id_usuario: userId, fecha, hora_salida: null },
      transaction: t,
    });

    if (parteAbierto) {
      await t.rollback();
      return res.status(400).json({
        message:
          "Ya tienes un parte abierto para esta fecha. Debes fichar salida.",
      });
    }

    // Verificar configuración de empresa (parte_auto y timezone)
    const { isParteAuto, timezone } = await getConfigEmpresa(empresaId);
    const ahora = getNowForEmpresa(timezone);

    // Validar que se haya seleccionado un proyecto si parte_auto está activado
    if (isParteAuto && !proyectoId) {
      await t.rollback();
      return res.status(400).json({
        message: "Debes seleccionar un proyecto.",
      });
    }

    // Crear parte sin localización (se actualiza luego)
    const fichaje = await db.CONTROL_ASISTENCIAS.create(
      {
        id_usuario: userId,
        fecha,
        hora_entrada: ahora,
      },
      { transaction: t }
    );

    if (isParteAuto && proyectoId) {
      await db.PARTES_TRABAJO.create(
        {
          id_usuario: userId,
          id_proyecto: proyectoId,
          fecha,
          hora_entrada: ahora,
        },
        { transaction: t }
      );
    }

    await t.commit();
    // Responder inmediatamente con el ID del fichaje
    res.status(201).json({ id: fichaje.id });
  } catch (error) {
    await t.rollback();
    console.error("Error al fichar entrada:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

// Fichar salida
const ficharSalidaHandler = async (req, res) => {
  const userId = req.user.id;
  const { canClockIn, empresa: empresaId } = req.user;
  const { date } = req.body;

  if (canClockIn === false) {
    return res
      .status(403)
      .json({ message: "Permiso para fichar desactivado." });
  }

  // Verificar tiempo mínimo
  const isTimeValid = await checkMinTimeFichaje(userId);
  if (!isTimeValid) {
    return res.status(429).json({
      message: "Por favor, espera unos segundos antes de volver a fichar.",
    });
  }

  const t = await db.sequelize.transaction();

  try {
    const fecha = formatFecha(date);
    // Verificar si hay un parte abierto para el usuario en esa fecha
    const parteAbierto = await db.CONTROL_ASISTENCIAS.findOne({
      where: {
        id_usuario: userId,
        fecha: fecha,
        hora_salida: null,
      },
      transaction: t,
    });

    if (!parteAbierto) {
      await t.rollback();
      return res.status(400).json({
        message:
          "No tienes un parte abierto para fecha. Debes fichar entrada primero.",
      });
    }

    // Verificar configuración de empresa (parte_auto y timezone)
    const { isParteAuto, timezone } = await getConfigEmpresa(empresaId);
    const ahora = getNowForEmpresa(timezone);

    // Actualizar parte con hora de salida
    parteAbierto.hora_salida = ahora;
    await parteAbierto.save({ transaction: t });

    if (isParteAuto) {
      const parteTrabajoAbierto = await db.PARTES_TRABAJO.findOne({
        where: {
          id_usuario: userId,
          fecha,
          hora_salida: null,
        },
        transaction: t,
      });

      if (parteTrabajoAbierto) {
        parteTrabajoAbierto.hora_salida = ahora;
        await parteTrabajoAbierto.save({ transaction: t });
      }
    }

    await t.commit();
    res.status(200).json({ id: parteAbierto.id });
  } catch (error) {
    await t.rollback();
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
      {
        localizacion_entrada:
          direccionFinal.formatted_address || direccionFinal,
      },
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
      {
        localizacion_salida: direccionFinal.formatted_address || direccionFinal,
      },
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
  const { empresa: empresaId } = req.user;
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

    const { timezone } = await getConfigEmpresa(empresaId);
    // Actualizar parte con hora de salida
    parteAbierto.hora_salida = getNowForEmpresa(timezone);
    await parteAbierto.save();

    res.status(200).json(parteAbierto.id);
  } catch (error) {
    console.error("Error al fichar salida:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

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
