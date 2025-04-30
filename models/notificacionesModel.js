const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerNotificacionesModel = async (id_usuario) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id_usuario", sql.Int, id_usuario)
      .query(`
        SELECT n.*, nu.leido, nu.fecha_leido, u.nomapes
        FROM notificaciones n
        INNER JOIN notificaciones_usuarios nu ON n.id = nu.id_notificacion
        LEFT JOIN Usuarios u ON u.id = n.id_emisor
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
    const result = await pool
      .request()
      .input("id", sql.Int, id_notificaciones)
      .input("id_usuario", sql.Int, id_usuario).query(`
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

const crearNotificacion = async ({
  asunto,
  cuerpo,
  fecha_emision,
  prioridad,
  destino,
  tipo_notificacion,
  id_emisor,
}) => {
  const pool = await sql.connect(config);

  // Validación del destino
  if (!Array.isArray(destino) || destino.some((d) => typeof d !== "number")) {
    throw new Error("Destino debe ser un array de IDs numéricos.");
  }

  try {
    // Insertar la notificación
    const request = new sql.Request(pool);
    request.input("asunto", sql.VarChar, asunto);
    request.input("cuerpo", sql.VarChar, cuerpo || null);
    request.input("fecha_emision", sql.DateTime, fecha_emision);
    request.input("prioridad", sql.Int, prioridad || 1);
    request.input("tipo_notificacion", sql.VarChar, tipo_notificacion);
    request.input("id_emisor", sql.Int, id_emisor);

    const insertNotifQuery = `
      INSERT INTO NOTIFICACIONES (asunto, cuerpo, fecha_emision, prioridad, tipo_notificacion, id_emisor)
      OUTPUT INSERTED.id
      VALUES (@asunto, @cuerpo, @fecha_emision, @prioridad, @tipo_notificacion, @id_emisor);
    `;

    // Ejecutamos la consulta de inserción
    const result = await request.query(insertNotifQuery);
    const id_notificacion = result.recordset[0].id;

    // Crear la tabla de destinatarios en memoria
    const destinatariosTable = new sql.Table("NOTIFICACIONES_USUARIOS");
    destinatariosTable.columns.add("id_notificacion", sql.Int, {
      nullable: false,
    });
    destinatariosTable.columns.add("id_usuario", sql.Int, { nullable: false });
    destinatariosTable.columns.add("leido", sql.Bit, { nullable: true });
    destinatariosTable.columns.add("fecha_leido", sql.DateTime, {
      nullable: true,
    });

    // Agregar filas de destinatarios
    destino.forEach((id_usuario) => {
      console.log(id_usuario);
      destinatariosTable.rows.add(id_notificacion, id_usuario, 0, null);
    });

    // Insertar los destinatarios
    await pool.request().bulk(destinatariosTable);

    // Retornar la respuesta
    return {
      id_notificacion,
      asunto,
      tipo_notificacion,
      destino,
    };
  } catch (err) {
    console.error("Error en crearNotificacion:", err);
    throw err;
  }
};

module.exports = {
  obtenerNotificacionesModel,
  marcarLeidaModel,
  obtenerArchivadasModel,
  crearNotificacion,
};
