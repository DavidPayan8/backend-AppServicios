const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerNotificacionesModel = async (id_usuario) => {
  console.log(id_usuario)
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id_usuario", sql.Int, id_usuario)
      .query(`
        SELECT n.*, nu.leido, nu.fecha_leido
        FROM notificaciones n
        INNER JOIN notificaciones_usuarios nu ON n.id = nu.id_notificacion
        WHERE nu.id_usuario = @id_usuario
          AND nu.leido = 0;
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
        SELECT n.*, nu.leido, nu.fecha_leido
        FROM notificaciones n
        INNER JOIN notificaciones_usuarios nu ON n.id = nu.id_notificacion
        WHERE nu.id_usuario = @id_usuario
          AND nu.leido = 1;
      `);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener notificaciones archivadas:", error.message);
    throw error;
  }
};

const marcarLeidaModel = async (id_notificaciones, id_usuario) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id", sql.Int, id_notificaciones)
    .input("id_usuario", sql.Int, id_usuario)
      .query(`
              UPDATE Notificaciones_Usuarios
              SET leido = 1,
              fecha_leido = GETDATE()
              WHERE id_notificacion = @id AND id_usuario = @id_usuario;
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
