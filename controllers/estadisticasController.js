const { Op, Sequelize } = require("sequelize");
const db = require("../Model");

const obtenerDatosTabla = async (req, res) => {
  const id_usuario = req.user.id;
  const { fechas, tipo } = req.body;
  let fechaInicio, fechaFin;
  if (tipo === "anio") {
    // Si solo es un año (por ejemplo, '2025')
    fechaInicio = new Date(`${fechas.anio}-01-01`);
    fechaFin = new Date(`${fechas.anio}-12-31`);
  } else if (tipo === "mes") {
    const [anio, mes] = fechas.split("-");
    fechaInicio = new Date(`${anio}-${mes}-01`);
    fechaFin = new Date(anio, mes, 0);
  } else {
    const { inicio, fin } = fechas;
    fechaInicio = new Date(inicio);
    fechaFin = new Date(fin);
  }
  try {
   // Obtener registros entre fechas
    const registros = await db.CONTROL_ASISTENCIAS.findAll({
      where: {
        id_usuario,
        fecha: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      raw: true,
    });

    // Obtener el total de horas trabajadas
    const total = await db.sequelize.query(
      `
      SELECT 
          SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS total_rango
        FROM control_asistencias
        WHERE id_usuario = :id_usuario
          AND CONVERT(DATE, hora_entrada) BETWEEN :fechaInicio AND :fechaFin;
    `,
      {
        replacements: { id_usuario, fechaInicio, fechaFin },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      registros,
      totalHoras: total.total_rango || 0,
    });
  } catch (error) {
    console.error(
      "Error al obtener estadísticas formato tabla:",
      error.message
    );
    throw error;
  }
};

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

const obtenerDatosDias = async (id_usuario, fechaInicio, fechaFin) => {
  try {
    const horasPorDia = await db.sequelize.query(
      `
      SELECT 
        CAST(hora_entrada AS DATE) AS fecha,
        SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS horas_trabajadas
      FROM control_asistencias
      WHERE id_usuario = :id_usuario
        AND hora_entrada BETWEEN :fechaInicio AND :fechaFin
      GROUP BY CAST(hora_entrada AS DATE)
      ORDER BY fecha;
      `,
      {
        replacements: {
          id_usuario,
          fechaInicio,
          fechaFin,
        },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    // Query 2: Total horas en el rango
    const [totalHorasResult] = await db.sequelize.query(
      `
      SELECT 
        SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS total_rango
      FROM control_asistencias
      WHERE id_usuario = :id_usuario
        AND hora_entrada BETWEEN :fechaInicio AND :fechaFin;
      `,
      {
        replacements: {
          id_usuario,
          fechaInicio,
          fechaFin,
        },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    return {
      horasPorDia,
      totalHoras: totalHorasResult?.total_rango || 0,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas por días:", error.message);
    throw error;
  }
};

const obtenerDatosMes = async (id_usuario, anio, mes) => {
  try {
    const horasPorDiaQuery = `
      SELECT 
        CAST(hora_entrada AS DATE) AS fecha,
        SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS horas_trabajadas
      FROM control_asistencias
      WHERE id_usuario = :id_usuario
        AND YEAR(hora_entrada) = :anio
        AND MONTH(hora_entrada) = :mes
      GROUP BY CAST(hora_entrada AS DATE)
      ORDER BY fecha;
    `;

    const totalMesQuery = `
      SELECT 
        SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS total_mes
      FROM control_asistencias
      WHERE id_usuario = :id_usuario
        AND YEAR(hora_entrada) = :anio
        AND MONTH(hora_entrada) = :mes;
    `;

    const horasPorDia = await db.sequelize.query(horasPorDiaQuery, {
      replacements: { id_usuario, anio, mes },
      type: Sequelize.QueryTypes.SELECT,
    });

    const [totalMes] = await db.sequelize.query(totalMesQuery, {
      replacements: { id_usuario, anio, mes },
      type: Sequelize.QueryTypes.SELECT,
    });

    return {
      horasPorDia,
      totalHoras: totalMes?.total_mes || 0,
    };
  } catch (error) {
    console.error("Error al obtener datos del mes:", error.message);
    throw error;
  }
};

const obtenerDatosAnio = async (id_usuario, anio) => {
  try {
    const horasPorMes = await db.sequelize.query(
      `
      SELECT
        MONTH(hora_entrada) AS mes,
        SUM(DATEDIFF(SECOND, hora_entrada, hora_salida)) / 3600.0 AS total_horas
      FROM control_asistencias
      WHERE id_usuario = :id_usuario 
        AND YEAR(hora_entrada) = :anio
        AND hora_salida IS NOT NULL -- Excluye registros abiertos
      GROUP BY MONTH(hora_entrada)
      ORDER BY mes
    `,
      {
        replacements: { id_usuario, anio },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    const [totalHoras] = await db.sequelize.query(
      `
      SELECT
        SUM(DATEDIFF(SECOND, hora_entrada, hora_salida)) / 3600.0 AS total_horas_anual
      FROM control_asistencias
      WHERE id_usuario = :id_usuario
        AND YEAR(hora_entrada) = :anio
        AND hora_salida IS NOT NULL
    `,
      {
        replacements: { id_usuario, anio },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    return {
      horasPorMes,
      totalHoras: totalHoras?.total_horas_anual || 0,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas anuales:", error.message);
    throw error;
  }
};

module.exports = {
  obtenerDatosTabla,
  obtenerHorasTotales,
};
