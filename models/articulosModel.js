const sql = require("mssql");
const config = require("../config/dbConfig");

let poolPromise;

const connectToDb = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
};

const getArticulos= async () => {
  try {
    const pool = await connectToDb();
    const result = await pool.request()
      .query(`
        SELECT *
        FROM Articulos`); //Poner limite de articulos.

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener articulos:", error.message);
    throw error;
  }
};

module.exports = {
  getArticulos,
};
