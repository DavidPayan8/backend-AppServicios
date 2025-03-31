const sql = require("mssql");
const config = require("../config/dbConfig");


const obtenerDatosTabla = async ( id_usuario,fechaInicio, fechaFin ) => {
  try {
    const pool = await sql.connect(config);
    // Consulta para obtener las horas trabajadas por cada día dentro del rango
    const resultHorasPorDia = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("fechaInicio", sql.Date, fechaInicio)
      .input("fechaFin", sql.Date, fechaFin).query(`
        SELECT * 
        FROM CONTROL_ASISTENCIAS 
        WHERE FECHA BETWEEN @fechaInicio AND @fechaFin;  
      `);

    // Consulta para obtener el total de horas trabajadas en el rango de fechas
    const resultTotalRango = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("fechaInicio", sql.Date, fechaInicio)
      .input("fechaFin", sql.Date, fechaFin).query(`
        SELECT 
          SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS total_rango
        FROM control_asistencias
        WHERE id_usuario = @id_usuario
          AND hora_entrada BETWEEN @fechaInicio AND @fechaFin;
      `);

    return {
      horasPorDia: resultHorasPorDia.recordset,
      totalHoras: resultTotalRango.recordset[0]?.total_rango || 0,
    };
  } catch (error) {
    console.error(
      "Error al obtener estadísticas por rango de fechas:",
      error.message
    );
    throw error;
  }
};



const obtenerDatosDias = async (id_usuario, fechaInicio, fechaFin) => {
  try {
    const pool = await sql.connect(config);
    // Consulta para obtener las horas trabajadas por cada día dentro del rango
    const resultHorasPorDia = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("fechaInicio", sql.Date, fechaInicio)
      .input("fechaFin", sql.Date, fechaFin).query(`
        SELECT 
          CAST(hora_entrada AS DATE) AS fecha,
          SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS horas_trabajadas
        FROM control_asistencias
        WHERE id_usuario = @id_usuario
          AND hora_entrada BETWEEN @fechaInicio AND @fechaFin
        GROUP BY CAST(hora_entrada AS DATE)
        ORDER BY fecha;
      `);

    // Consulta para obtener el total de horas trabajadas en el rango de fechas
    const resultTotalRango = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("fechaInicio", sql.Date, fechaInicio)
      .input("fechaFin", sql.Date, fechaFin).query(`
        SELECT 
          SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS total_rango
        FROM control_asistencias
        WHERE id_usuario = @id_usuario
          AND hora_entrada BETWEEN @fechaInicio AND @fechaFin;
      `);

    return {
      horasPorDia: resultHorasPorDia.recordset,
      totalHoras: resultTotalRango.recordset[0]?.total_rango || 0,
    };
  } catch (error) {
    console.error(
      "Error al obtener estadísticas por rango de fechas:",
      error.message
    );
    throw error;
  }
};

const obtenerDatosMes = async (id_usuario, anio, mes) => {
  try {
    const pool = await sql.connect(config);

    // Consulta para obtener las horas por día
    const resultHorasPorDia = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("anio", sql.Int, anio)
      .input("mes", sql.Int, mes).query(`
        SELECT 
          CAST(hora_entrada AS DATE) AS fecha,
          SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS horas_trabajadas
        FROM control_asistencias
        WHERE id_usuario = @id_usuario
          AND YEAR(hora_entrada) = @anio
          AND MONTH(hora_entrada) = @mes
        GROUP BY CAST(hora_entrada AS DATE)
        ORDER BY fecha;
      `);

    // Verificar si se obtuvieron las horas por día correctamente
    if (
      !resultHorasPorDia.recordset ||
      resultHorasPorDia.recordset.length === 0
    ) {
      console.error("No se encontraron horas trabajadas por día");
    }

    // Consulta para obtener el total de horas trabajadas en el mes
    const resultTotalMes = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("anio", sql.Int, anio)
      .input("mes", sql.Int, mes).query(`
        SELECT 
          SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS total_mes
        FROM control_asistencias
        WHERE id_usuario = @id_usuario
          AND YEAR(hora_entrada) = @anio
          AND MONTH(hora_entrada) = @mes;
      `);

    // Verificar si se obtuvo el total del mes correctamente
    const totalMes = resultTotalMes.recordset[0]?.total_mes || 0;
    if (totalMes === 0) {
      console.error("No se encontró el total de horas para el mes");
    }

    // Retornar los datos de las horas por día y el total de horas
    return {
      horasPorDia: resultHorasPorDia.recordset,
      totalHoras: totalMes,
    };
  } catch (error) {
    console.error("Error al obtener datos del mes:", error.message);
    throw error;
  }
};

const obtenerDatosAnio = async (id_usuario, anio) => {
  try {
    const pool = await sql.connect(config);

    // Consulta mensual: Horas trabajadas por mes
    const resultMensual = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("anio", sql.Int, anio).query(`
        SELECT
            MONTH(hora_entrada) AS mes,
            SUM(DATEDIFF(SECOND, hora_entrada, hora_salida)) / 3600.0 AS total_horas
        FROM control_asistencias
        WHERE id_usuario = @id_usuario 
            AND YEAR(hora_entrada) = @anio
            AND hora_salida IS NOT NULL -- Excluye registros abiertos
        GROUP BY MONTH(hora_entrada)
        ORDER BY mes;
      `);

    // Consulta anual: Total de horas trabajadas en el año
    const resultAnual = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("anio", sql.Int, anio).query(`
        SELECT
            SUM(DATEDIFF(SECOND, hora_entrada, hora_salida)) / 3600.0 AS total_horas_anual
        FROM control_asistencias
        WHERE id_usuario = @id_usuario 
            AND YEAR(hora_entrada) = @anio
            AND hora_salida IS NOT NULL;
      `);

    return {
      horasPorMes: resultMensual.recordset,
      totalHoras: resultAnual.recordset[0]?.total_horas_anual || 0,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas anuales:", error.message);
    throw error;
  }
};

module.exports = {
  obtenerDatosDias,
  obtenerDatosMes,
  obtenerDatosAnio,
  obtenerDatosTabla
};
