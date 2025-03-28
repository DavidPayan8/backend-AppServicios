const {
  obtenerDatosDias,
  obtenerDatosMes,
  obtenerDatosAnio,
} = require("../models/estadisticasModel");

const obtenerHorasTotales = async (req, res) => {
  const id_usuario = req.user.id;
  const { fechas, tipo } = req.body;
  let datosTotales;
  try {
    if (tipo === "anio") {
      datosTotales = await obtenerDatosAnio(id_usuario, fechas.anio);
    } else if (tipo === "mes") {
      const [anio, mes] = fechas.split("-");
      datosTotales = await obtenerDatosMes(id_usuario, anio, mes);
    } else {
      datosTotales = await obtenerDatosDias(
        id_usuario,
        fechas.inicio,
        fechas.fin
      );
    }
    res.status(200).json(datosTotales);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener datos totales.",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerHorasTotales,
};
