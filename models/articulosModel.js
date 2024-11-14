const sql = require("mssql");
const config = require("../config/dbConfig");

let poolPromise;

const connectToDb = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
};

const getArticulosPorOt = async (id_Ot) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().input("id_proyecto", sql.Int, id_Ot)
      .query(`
        SELECT Lista_Articulos_Partes.*, articulos.nombre ,articulos.utiles
        FROM Lista_Articulos_Partes
        INNER JOIN articulos ON Lista_Articulos_Partes.id_articulo = articulos.id
        WHERE Lista_Articulos_Partes.id_proyecto = @id_proyecto`);

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener lista de articulos:", error.message);
    throw error;
  }
};

module.exports = {
  getArticulosPorOt,
};
