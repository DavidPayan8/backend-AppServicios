const {
  obtenerDatosDias,
  obtenerDatosMes,
  obtenerDatosAnio,
  obtenerDatosTabla
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

const obtenerHorasformatoTabla = async (req, res) => {
  const id_usuario = req.user.id;
  const { fechas, tipo } = req.body;
  let fechaInicio, fechaFin;
  console.log(fechas)
  if (tipo === "anio") {
    // Si solo es un año (por ejemplo, '2025')
    fechaInicio = new Date(`${fechas}-01-01`);
    fechaFin = new Date(`${fechas}-12-31`);  
  } else if (tipo === "mes") {
    const [anio, mes] = fechas.split('-');
    fechaInicio = new Date(`${anio}-${mes}-01`);
    // El último día del mes se calcula con el siguiente mes y día 0
    fechaFin = new Date(`${anio}-${mes}-01`);
    fechaFin.setMonth(fechaFin.getMonth() + 1);  
    fechaFin.setDate(0); 
  } else {
    const [inicio, fin] = fechas.split(' ');
    fechaInicio = new Date(inicio); 
    fechaFin = new Date(fin);
  }

  try {
    datosTotales = await obtenerDatosTabla(id_usuario, fechaInicio, fechaFin);

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
  obtenerHorasformatoTabla,
};
