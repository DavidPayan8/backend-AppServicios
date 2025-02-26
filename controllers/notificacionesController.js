const {
  obtenerNotificacionesModel,
  obtenerArchivadasModel,
  marcarLeidaModel
}  = require("../models/notificacionesModel");

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
    const notificaciones = await obtenerArchivadasModel(
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


const marcarLeida = async (req, res) => {
  const id_notificacion = req.body.id_notificacion;
  try {
    const estaLeida = await marcarLeidaModel(
      id_notificacion
    );
    res.status(200).json(estaLeida);
  } catch (error) {
    res.status(500).json({
      message: "Error al marcar como leida.",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerNotificaciones,
  obtenerArchivadas,
  marcarLeida,
};
