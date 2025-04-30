const {
  obtenerNotificacionesModel,
  obtenerArchivadasModel,
  marcarLeidaModel,
  crearNotificacion
} = require("../models/notificacionesModel");

const obtenerNotificaciones = async (req, res) => {
  const id_usuario = req.user.id;
  try {
    const notificaciones = await obtenerNotificacionesModel(
      id_usuario
    );
    res.status(200).json(notificaciones);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener notificaciones.",
      error: error.message,
    });
  }
};
const obtenerArchivadas = async (req, res) => {
  const id_usuario = req.user.id;
  try {
    const notificaciones = await obtenerArchivadasModel(id_usuario);
    res.status(200).json(notificaciones);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener notificaciones.",
      error: error.message,
    });
  }
};

const marcarLeida = async (req, res) => {
  const id_usuario = req.user.id;
  const id_notificacion = req.body.id_notificacion;
  try {
    const estaLeida = await marcarLeidaModel(id_notificacion, id_usuario);
    res.status(200).json(estaLeida);
  } catch (error) {
    res.status(500).json({
      message: "Error al marcar como leida.",
      error: error.message,
    });
  }
};

const crearNotificacionHandler = async (req, res) => {
  const id_emisor = req.user.id; // Desde el token autenticado
  const {
    asunto,
    cuerpo,
    fecha_emision,
    prioridad,
    destino,
    tipo_notificacion
  } = req.body;

  if (!asunto || !fecha_emision || !Array.isArray(destino) || destino.length === 0) {
    return res.status(400).json({ message: 'Faltan campos requeridos o destino inválido.' });
  }

  try {
    // Llamada al modelo para crear la notificación
    const result = await crearNotificacion({
      asunto,
      cuerpo,
      fecha_emision,
      prioridad,
      destino,
      tipo_notificacion,
      id_emisor
    });

    res.status(201).json({ message: 'Notificación creada correctamente', data: result });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ message: 'Error del servidor al crear notificación' });
  }
};


module.exports = {
  obtenerNotificaciones,
  obtenerArchivadas,
  marcarLeida,
  crearNotificacion: crearNotificacionHandler
};
