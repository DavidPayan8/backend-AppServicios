const sql = require("mssql");
const config = require("../config/dbConfig");

const checkParteAbierto = async (id_usuario, id_proyecto, fecha) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("id_proyecto", sql.Int, id_proyecto).query(`SELECT * 
                    FROM PARTES_TRABAJO 
                    WHERE id_usuario = @id_usuario 
                      AND id_proyecto = @id_proyecto 
                      AND hora_salida IS NULL`);

    return result.recordset.length > 0; // Devuelve true si hay partes abiertos, false si no
  } catch (error) {
    console.error("Error al comprobar partes abiertos:", error.message);
    throw error;
  }
};

// Crear nuevo "parte_trabajo"
const crearParteTrabajo = async ({
  id_usuario,
  id_capitulo,
  id_partida,
  id_proyecto,
  hora_entrada,
  fecha,
  localizacion_entrada,
}) => {

  try {
    const pool = await sql.connect(config);

    // Obtener el próximo ID disponible

    console.log(hora_entrada)
    // Insertar el nuevo parte de trabajo
    const result = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("id_capitulo", sql.Int, id_capitulo)
      .input("id_partida", sql.Int, id_partida)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("hora_entrada", sql.VarChar, hora_entrada)
      .input("fecha", sql.Date, fecha)
      .input("localizacion_entrada", sql.VarChar, localizacion_entrada)
      .query(`INSERT INTO PARTES_TRABAJO ( id_usuario, id_capitulo , id_partida ,id_proyecto, hora_entrada, fecha, localizacion_entrada)
              OUTPUT INSERTED.id
              VALUES (@id_usuario, @id_capitulo, @id_partida ,@id_proyecto, @hora_entrada, @fecha, @localizacion_entrada)`);

    return result.recordset[0].id; // Retornar el ID del nuevo registro
  } catch (error) {
    console.error(
      "Error al crear parte de trabajo en el modelo:",
      error.message
    );
    throw error;
  }
};

const getPartes = async (id_usuario, id_proyecto, fecha) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("fecha", sql.Date, fecha).query(`
                SELECT * 
                FROM PARTES_TRABAJO 
                WHERE id_usuario = @id_usuario 
                  AND id_proyecto = @id_proyecto 
            `);  /* AND fecha = @fecha */

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener partes de trabajo:", error.message);
    throw error;
  }
};

const getParte = async (id_parte, id_usuario) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id_parte)
      .input("id_usuario", sql.Int, id_usuario)
      .query(`
        SELECT * 
        FROM PARTES_TRABAJO 
        WHERE id_usuario = @id_usuario 
          AND id = @id
      `);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener partes de trabajo:", error.message);
    throw error;
  }
};


const actualizarParteTrabajo = async (
  id,
  id_capitulo,
  id_partida,
  id_proyecto,
  hora_salida,
  horas_extra,
  horas_festivo,
  localizacion_salida
) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("id_capitulo", sql.Int, id_capitulo)
      .input("id_partida", sql.Int, id_partida)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("hora_salida", sql.VarChar, hora_salida)
      .input("horas_festivo", sql.Int, horas_festivo)
      .input("horas_extra", sql.Int, horas_extra)
      .input("localizacion_salida", sql.VarChar, localizacion_salida).query(`
        UPDATE PARTES_TRABAJO 
        SET id_capitulo = @id_capitulo,
            id_partida = @id_partida,
            id_proyecto = @id_proyecto,
            hora_salida = @hora_salida, 
            horas_festivo = @horas_festivo, 
            horas_extra = @horas_extra,
            localizacion_salida = @localizacion_salida
        WHERE id = @id
      `);

  } catch (error) {
    console.error(
      "Error al actualizar el parte de trabajo:",
      id,
      id_capitulo,
      id_partida,
      id_proyecto,
      hora_salida,
      horas_festivo,
      horas_extra
    );
    throw error;
  }
};

const getCapitulos = async (id_proyecto) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id_proyecto", sql.Int, id_proyecto).query(`
                SELECT *
                FROM CAPITULOS
                WHERE id_proyecto = @id_proyecto
            ;`);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener capitulos:", error.message);
  }
};

const getPartidas = async (id_capitulo, id_proyecto) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id_capitulo", sql.Int, id_capitulo)
      .input("id_proyecto", sql.Int, id_proyecto).query(`
                SELECT * 
                FROM PARTIDAS 
                WHERE id_capitulo = @id_capitulo
                  AND id_proyecto = @id_proyecto
            `);

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener partidas:", error.message);
    throw error;
  }
};

module.exports = {
  checkParteAbierto,
  crearParteTrabajo,
  getPartes,
  getParte,
  actualizarParteTrabajo,
  getCapitulos,
  getPartidas,
};
