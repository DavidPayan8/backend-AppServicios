const sql = require("mssql");
const config = require("../config/dbConfig");

let poolPromise;

const connectToDb = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
};


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

const getProyectos = async (ids) => {
  try {
    let idsString = "";
    const pool = await connectToDb();

    // Convertir array de IDs en formato adecuado para SQL
      idsString = ids.join(",");

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
  id_cliente,
  id_usuario,
  fechaCalendario
) => {
  let transaction;
  try {
    const pool = await connectToDb();
    transaction = new sql.Transaction(pool);

    // Iniciar la transacción
    await transaction.begin();

    // Crear el nuevo proyecto
    const request = new sql.Request(transaction);

    // Obtener el próximo ID para el nuevo proyecto
    let idResult = await request.query(
      "SELECT MAX(id) AS maxId FROM PROYECTOS"
    );
    let idProyecto = (idResult.recordset[0].maxId || 0) + 1;

    // Insertar el nuevo proyecto
    await request
      .input("idProyecto", sql.Int, idProyecto)
      .input("nombre", sql.VarChar, nombre)
      .input("observaciones", sql.VarChar, observaciones)
      .input("id_cliente", sql.Int, id_cliente)
      .query(`INSERT INTO PROYECTOS (id, nombre, observaciones, id_cliente)
                    VALUES (@idProyecto, @nombre, @observaciones, @id_cliente)`);

    // Obtener el próximo ID para el calendario
    let idResultCalendario = await request.query(
      "SELECT MAX(id) AS maxId FROM CALENDARIO"
    );
    let idCalendario = (idResultCalendario.recordset[0].maxId || 0) + 1;

    // Insertar la entrada en el calendario
    await request
      .input("idCalendario", sql.Int, idCalendario)
      .input("fecha", sql.Date, fechaCalendario)
      .input("id_usuario", sql.Int, id_usuario)
      .input("id_proyecto", sql.Int, idProyecto)
      .query(`INSERT INTO CALENDARIO (id, fecha, id_usuario, id_proyecto)
                    VALUES (@idCalendario, @fecha, @id_usuario, @id_proyecto)`);

    // Confirmar la transacción
    await transaction.commit();

    // Retornar el ID del nuevo proyecto
    return { id: idProyecto };
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
