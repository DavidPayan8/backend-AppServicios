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
    // Obtener registros de control_asistencias + horas_extra (UNION)
    const registros = await db.sequelize.query(
      `
      SELECT id, fecha, hora_entrada, hora_salida, 'fichaje' AS tipo
      FROM control_asistencias
      WHERE id_usuario = :id_usuario
        AND fecha BETWEEN :fechaInicio AND :fechaFin

      UNION ALL

      SELECT id, CAST(fecha AS DATE) AS fecha,
        horaInicio AS hora_entrada,
        horaFin AS hora_salida,
        'extra' AS tipo
      FROM horas_extra
      WHERE empleado = :id_usuario
        AND fecha BETWEEN :fechaInicio AND :fechaFin

      ORDER BY fecha DESC
    `,
      {
        replacements: { id_usuario, fechaInicio, fechaFin },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    // Obtener el total de horas (fichajes + horas extra)
    const total = await db.sequelize.query(
      `
      SELECT
        (
          SELECT ISNULL(SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)), 0)
          FROM control_asistencias
          WHERE id_usuario = :id_usuario
            AND fecha BETWEEN :fechaInicio AND :fechaFin
        )
        +
        (
          SELECT ISNULL(SUM(duracionMinutos), 0)
          FROM horas_extra
          WHERE empleado = :id_usuario
            AND fecha BETWEEN :fechaInicio AND :fechaFin
        ) AS total_minutos
    `,
      {
        replacements: { id_usuario, fechaInicio, fechaFin },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    const totalMinutos = total[0]?.total_minutos || 0;
    const totalHoras = totalMinutos / 60;

    res.status(200).json({
      registros,
      totalHoras,
    });
  } catch (error) {
    console.error(
      "Error al obtener estadísticas formato tabla:",
      error.message
    );
    res.status(500).json({ error: "Error al obtener estadísticas" });
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
        CONVERT(varchar(10), fecha, 23) AS fecha,
        SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS horas_trabajadas
      FROM control_asistencias
      WHERE id_usuario = :id_usuario
        AND fecha BETWEEN :fechaInicio AND :fechaFin
      GROUP BY fecha
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

    // Query 2: Total horas en el rango (fichajes + horas extra)
    const [totalHorasResult] = await db.sequelize.query(
      `
      SELECT
        (
          SELECT ISNULL(SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)), 0)
          FROM control_asistencias
          WHERE id_usuario = :id_usuario
            AND fecha BETWEEN :fechaInicio AND :fechaFin
        )
        +
        (
          SELECT ISNULL(SUM(duracionMinutos), 0)
          FROM horas_extra
          WHERE empleado = :id_usuario
            AND fecha BETWEEN :fechaInicio AND :fechaFin
        ) AS total_minutos
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

    const totalMinutos = totalHorasResult?.total_minutos || 0;
    return {
      horasPorDia,
      totalHoras: totalMinutos / 60,
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
        CONVERT(varchar(10), fecha, 23) AS fecha,
        SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS horas_trabajadas
      FROM control_asistencias
      WHERE id_usuario = :id_usuario
        AND YEAR(fecha) = :anio
        AND MONTH(fecha) = :mes
      GROUP BY fecha
      ORDER BY fecha;
    `;

    const totalMesQuery = `
      SELECT
        (
          SELECT ISNULL(SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)), 0)
          FROM control_asistencias
          WHERE id_usuario = :id_usuario
            AND YEAR(fecha) = :anio
            AND MONTH(fecha) = :mes
        )
        +
        (
          SELECT ISNULL(SUM(duracionMinutos), 0)
          FROM horas_extra
          WHERE empleado = :id_usuario
            AND YEAR(fecha) = :anio
            AND MONTH(fecha) = :mes
        ) AS total_minutos
    `;

    const horasPorDia = await db.sequelize.query(horasPorDiaQuery, {
      replacements: { id_usuario, anio, mes },
      type: Sequelize.QueryTypes.SELECT,
    });

    const [totalMes] = await db.sequelize.query(totalMesQuery, {
      replacements: { id_usuario, anio, mes },
      type: Sequelize.QueryTypes.SELECT,
    });

    const totalMinutos = totalMes?.total_minutos || 0;
    return {
      horasPorDia,
      totalHoras: totalMinutos / 60,
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
        MONTH(fecha) AS mes,
        SUM(DATEDIFF(SECOND, hora_entrada, hora_salida)) / 3600.0 AS total_horas
      FROM control_asistencias
      WHERE id_usuario = :id_usuario
        AND YEAR(fecha) = :anio
        AND hora_salida IS NOT NULL -- Excluye registros abiertos
      GROUP BY MONTH(fecha)
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
        (
          SELECT ISNULL(SUM(DATEDIFF(SECOND, hora_entrada, hora_salida)), 0)
          FROM control_asistencias
          WHERE id_usuario = :id_usuario
            AND YEAR(fecha) = :anio
            AND hora_salida IS NOT NULL
        )
        +
        (
          SELECT ISNULL(SUM(duracionMinutos * 60), 0)
          FROM horas_extra
          WHERE empleado = :id_usuario
            AND YEAR(fecha) = :anio
        ) AS total_segundos
      `,
      {
        replacements: { id_usuario, anio },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    const totalSegundos = totalHoras?.total_segundos || 0;
    return {
      horasPorMes,
      totalHoras: totalSegundos / 3600,
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
