const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerDatosHoras = async (id_usuario, anio) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("anio", sql.Int, anio).query(`
        SELECT
        MONTH(hora_entrada) AS mes,
        SUM(DATEDIFF(MINUTE, hora_entrada, hora_salida)) / 60.0 AS total_horas
        FROM control_asistencias WHERE id_usuario = @id_usuario
        AND YEAR(hora_entrada) = @anio
        GROUP BY YEAR(hora_entrada), MONTH(hora_entrada);`);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener notificaciones:", error.message);
    throw error;
  }
};

module.exports = {
  obtenerDatosHoras,
};
