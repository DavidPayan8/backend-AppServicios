const sql = require("mssql");
const config = require("../config/dbConfig");

let poolPromise;

const connectToDb = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
};


// Obtiene los ids de los proyectos, por usuario
const getIdProyectos = async (userId, date) => {
  try {
    const pool = await connectToDb();
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("date", sql.Date, date)
      .query(`SELECT id_proyecto, hora_inicio, hora_fin FROM CALENDARIO
                    WHERE (id_usuario = @userId OR id_usuario = 0) AND fecha = @date`);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener registro de asistencia:", error.message);
    throw error;
  }
};

// Obtiene los proyectos por ids
const getProyectos = async (ids) => {
  try {
    let idsString = "";
    const pool = await connectToDb();

    // Convertir array de IDs en formato adecuado para SQL
    ids.length > 1 ? idsString = ids.join(","): idsString = ids

    const query = `SELECT * FROM PROYECTOS WHERE id IN (${idsString})`;

    let result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener los proyectos por IDs:", error.message);
    throw error;
  }
};



// Función para agregar un proyecto y crear una entrada en el calendario
const addProyecto = async (
  nombre,
  observaciones,
  id_usuario,
  id_cliente,
  fechaCalendario,
  es_ote
) => {
  let transaction;
  try {
    const pool = await connectToDb();
    transaction = new sql.Transaction(pool);

    // Iniciar la transacción
    await transaction.begin();

    // Crear el nuevo proyecto
    const request = new sql.Request(transaction);
    let result = null;

    // Insertar el nuevo proyecto y devuelve el id generado
    // Si no hay cliente se pone como nulo, si hay, se pone su Id
    if (id_cliente === 0) {
      result= await request
        .input("nombre", sql.VarChar, nombre)
        .input("observaciones", sql.VarChar, observaciones)
        .input("es_ote", sql.Bit, es_ote)
        .query(`INSERT INTO PROYECTOS ( nombre, observaciones, id_cliente, es_ote)
              OUTPUT inserted.id
              VALUES (  @nombre, @observaciones, null, @es_ote)`);
    }else{
      result= await request
          .input("id_cliente", sql.Int, id_cliente)
          .input("nombre", sql.VarChar, nombre)
          .input("observaciones", sql.VarChar, observaciones)
          .input("es_ote", sql.Bit, es_ote)
          .query(`INSERT INTO PROYECTOS ( nombre, observaciones, id_cliente, es_ote)
                OUTPUT inserted.id
                VALUES ( @nombre, @observaciones, @id_cliente, @es_ote)`);
    }



    // Insertar la entrada en el calendario
   await request
      .input("fecha", sql.Date, fechaCalendario)
      .input("id_usuario", sql.Int, id_usuario)
      .input("id_proyecto", sql.Int, result.recordset[0].id)
      .query(`INSERT INTO CALENDARIO ( fecha, id_usuario, id_proyecto)
                    VALUES ( @fecha, @id_usuario, @id_proyecto)`);

    // Confirmar la transacción
    await transaction.commit();

    // Retornar el ID del nuevo proyecto
    return { id: result.recordset[0].id };
  } catch (error) {
    // Revertir la transacción en caso de error
    if (transaction) {
      await transaction.rollback();
    }
    console.error(
      "Error al agregar un nuevo proyecto y calendario:",
      error.message
    );
    throw error;
  }
};

module.exports = {
  getIdProyectos,
  getProyectos,
  addProyecto,
};
