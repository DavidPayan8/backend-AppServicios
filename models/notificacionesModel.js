const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerNotificaciones = async (id_usuario) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id_usuario", sql.Int, id_usuario)
      .query(`
              SELECT * 
              FROM NOTIFICACIONES 
              WHERE id_usuario = @id_usuario
              AND leido = 0
              `);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener notificaciones de trabajo:", error.message);
    throw error;
  }
};
const obtenerArchivadas = async (id_usuario) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id_usuario", sql.Int, id_usuario)
      .query(`
              SELECT * 
              FROM NOTIFICACIONES 
              WHERE id_usuario = @id_usuario
              AND leido = 1
              `);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener notificaciones de trabajo:", error.message);
    throw error;
  }
};

const marcarLeida = async (id_notificaciones) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id", sql.Int, id_notificaciones)
      .query(`
              UPDATE Notificaciones 
              SET leido = 1,
              fecha_leido = GETDATE()
              WHERE id = @id;
              `);
    return result.rowsAffected[0];
  } catch (error) {
    console.error("Error al obtener notificaciones de trabajo:", error.message);
    throw error;
  }
};

module.exports = {
  obtenerNotificaciones,
  marcarLeida,
  obtenerArchivadas,
};
