const sql = require("mssql");
const config = require("../config/dbConfig");

const checkParteAbierto = async (id_usuario, id_proyecto, fecha) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("fecha", sql.Date, fecha).query(`SELECT * 
                    FROM PARTES_TRABAJO 
                    WHERE id_usuario = @id_usuario 
                      AND id_proyecto = @id_proyecto 
                      AND fecha = @fecha 
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
  localizacion,
  horas_extra,
  horas_festivo,
}) => {
  console.log("Entrando en crearParteTrabajo en el modelo");

  try {
    const pool = await sql.connect(config);

    // Obtener el próximo ID disponible
    const idResult = await pool
      .request()
      .query("SELECT ISNULL(MAX(id), 0) AS maxId FROM PARTES_TRABAJO");
    let id = idResult.recordset[0].maxId + 1;
    console.log("ID a insertar:", id);

    // Insertar el nuevo parte de trabajo
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("id_usuario", sql.Int, id_usuario)
      .input("id_capitulo", sql.Int, id_capitulo)
      .input("id_partida", sql.Int, id_partida)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("hora_entrada", sql.Time, hora_entrada)
      .input("fecha", sql.Date, fecha)
      .input("localizacion", sql.VarChar, localizacion)
      .input("horas_extra", sql.Int, horas_extra)
      .input("horas_festivo", sql.Int, horas_festivo)
      .query(`INSERT INTO PARTES_TRABAJO (id, id_usuario, id_capitulo , id_partida ,id_proyecto, hora_entrada, fecha, localizacion, horas_extra, horas_festivo)
                    VALUES (@id, @id_usuario, @id_capitulo, @id_partida ,@id_proyecto, @hora_entrada, @fecha, @localizacion, @horas_extra, @horas_festivo)`);

    return id; // Retornar el ID del nuevo registro
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
                  AND fecha = @fecha
            `);

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener partes de trabajo:", error.message);
    throw error;
  }
};

const getParte = async (id_parte, id_usuario) => {
  const id = id_parte;
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
        console.log(result.recordset[0])
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
) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("id_capitulo", sql.Int, id_capitulo)
      .input("id_partida", sql.Int, id_partida)
      .input("id_proyecto", sql.Int, id_proyecto)
      .input("hora_salida", sql.Time, hora_salida)
      .input("horas_festivo", sql.Int, horas_festivo)
      .input("horas_extra", sql.Int, horas_extra).query(`
        UPDATE PARTES_TRABAJO 
        SET id_capitulo = @id_capitulo,
            id_partida = @id_partida,
            id_proyecto = @id_proyecto,
            hora_salida = @hora_salida, 
            horas_festivo = @horas_festivo, 
            horas_extra = @horas_extra 
        WHERE id = @id
      `);

    console.log("Parte de trabajo actualizado en la base de datos:", result);
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
