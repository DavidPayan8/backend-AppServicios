const {
    obtenerDatosHoras
}  = require("../models/estadisticasModel");

  const obtenerHorasTotales = async (req, res) => {
    const empresa = req.user.empresa;
    const id_usuario = req.user.id;
    const anio = req.body.anio
    try {
      const datosTotales = await obtenerDatosHoras(
        id_usuario, anio, empresa
      );
      res.status(200).json(datosTotales);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener datos totales.",
        error: error.message,
      });
    }
  };

  module.exports = {
    obtenerHorasTotales
  };