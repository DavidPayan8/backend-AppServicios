const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerNotificacionesModel = async (id_usuario) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id_usuario", sql.Int, id_usuario)
      .query(`
              SELECT n.*
              FROM notificaciones n
              INNER JOIN notificaciones_usuarios nu ON n.id = nu.id_notificacion
              WHERE nu.id_usuario = @id_usuario
              AND n.leido = 0;
              `);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener notificaciones:", error.message);
    throw error;
  }
};
const obtenerArchivadasModel = async (id_usuario) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id_usuario", sql.Int, id_usuario)
      .query(`
              SELECT n.*
              FROM notificaciones n
              INNER JOIN notificaciones_usuarios nu ON n.id = nu.id_notificacion
              WHERE nu.id_usuario = @id_usuario
              AND n.leido = 1;
              `);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener notificaciones leidas:", error.message);
    throw error;
  }
};

const marcarLeidaModel = async (id_notificaciones) => {
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
    console.error("Error al setear leido las notificaciones:", error.message);
    throw error;
  }
};

module.exports = {
  obtenerNotificacionesModel,
  marcarLeidaModel,
  obtenerArchivadasModel,
};
