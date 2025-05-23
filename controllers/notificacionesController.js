const db = require("../Model");
const { fn } = require("sequelize");

const obtenerNotificacionesModel = async (req, res) => {
  const id_usuario = req.user.id;
  try {
    const results = await db.NOTIFICACIONES_USUARIOS.findAll({
      where: {
        id_usuario,
        leido: false,
      },
      include: [
        {
          model: db.NOTIFICACIONES,
          as: "notificacion",
          include: [
            {
              model: db.USUARIOS,
              as: "emisor",
              attributes: ["nomapes"],
            },
          ],
        },
      ],
      attributes: ["leido", "fecha_leido"],
    });

    const notificaciones = results.map((result) => {
      const notificacion = result.notificacion;
      return {
        id_notificacion: notificacion.id,
        asunto: notificacion.asunto,
        cuerpo: notificacion.cuerpo,
        fecha_emision: notificacion.fecha_emision,
        prioridad: notificacion.prioridad,
        tipo_notificacion: notificacion.tipo_notificacion,
        leido: result.leido,
        fecha_leido: result.fecha_leido,
        emisor: notificacion.emisor.nomapes,
      };
    });

    res.status(200).json(notificaciones);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener las notificaciones" });
  }
};

const obtenerArchivadas = async (req, res) => {
  const id_usuario = req.user.id;
  try {
    const results = await db.NOTIFICACIONES_USUARIOS.findAll({
      where: {
        id_usuario,
        leido: true,
      },
      include: [
        {
          model: db.NOTIFICACIONES,
          as: "notificacion",
          include: [
            {
              model: db.USUARIOS,
              as: "emisor",
              attributes: ["nomapes"],
            },
          ],
        },
      ],
      attributes: ["leido", "fecha_leido"],
    });

    const notificaciones = results.map((result) => {
      const notificacion = result.notificacion;
      return {
        id_notificacion: notificacion.id,
        asunto: notificacion.asunto,
        cuerpo: notificacion.cuerpo,
        fecha_emision: notificacion.fecha_emision,
        prioridad: notificacion.prioridad,
        tipo_notificacion: notificacion.tipo_notificacion,
        leido: result.leido,
        fecha_leido: result.fecha_leido,
        emisor: notificacion.emisor.nomapes,
      };
    });

    res.status(200).json(notificaciones);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener las notificaciones" });
  }
};

const marcarLeida = async (req, res) => {
  const id_usuario = req.user.id;
  const { id_notificacion } = req.body;
  try {
    const [rowsUpdated] = await db.NOTIFICACIONES_USUARIOS.update(
      { leido: true, fecha_leido: fn("GETDATE") },
      {
        where: {
          id_notificacion,
          id_usuario,
          leido: false,
        },
      }
    );

    if (rowsUpdated === 0) {
      res
        .status(500)
        .json({ message: "No se pudo marcar la notificación como leída" });
    }

    res.status(201).json({ message: "Notificación marcada como leída." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error al marcar la notificación como leída." });
  }
};

const crearNotificacionHandler = async (req, res) => {
  const id_emisor = req.user.id;
  const {
    asunto,
    cuerpo,
    prioridad,
    destino,
    tipo_notificacion,
  } = req.body;

  if (!Array.isArray(destino) || destino.some((d) => typeof d !== "number")) {
    return res
      .status(400)
      .json({ message: "Faltan campos requeridos o destino inválido." });
  }

  const t = await db.sequelize.transaction();
  try {
    const notificacion = await db.NOTIFICACIONES.create(
      {
        asunto,
        cuerpo,
        fecha_emision: fn("GETDATE"),
        prioridad: prioridad || 1,
        tipo_notificacion,
        id_emisor,
      },
      { transaction: t }
    );
    // Crear registros para cada destinatario
    const destinatarios = destino.map((id_usuario) => ({
      id_notificacion: notificacion.id,
      id_usuario,
      leido: false,
      fecha_leido: null,
    }));

    await db.NOTIFICACIONES_USUARIOS.bulkCreate(destinatarios, {
      transaction: t,
    });

    await t.commit();

    res.status(201).json({ message: "Notificación enviada correctamente" });
  } catch (error) {
    console.error("Error en crearNotificacion:", error);
    await t.rollback();
    res
      .status(500)
      .json({ message: "Error del servidor al crear notificación" });
  }
};

module.exports = {
  obtenerNotificaciones: obtenerNotificacionesModel,
  obtenerArchivadas,
  marcarLeida,
  crearNotificacion: crearNotificacionHandler,
};
