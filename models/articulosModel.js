const sql = require("mssql");
const config = require("../config/dbConfig");

let poolPromise;

const connectToDb = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
};

const getArticulos = async () => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query(`
        SELECT *
        From Articulos;
`); //Poner limite de articulos.

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener articulos:", error.message);
    throw error;
  }
};

const get_iva_and_descuento = async () => {
  try {
    const pool = await connectToDb();
    const ivas = await pool.request().query(`
        SELECT *
        From Tipos_Iva;
`);
    const descuentos = await pool.request().query(`
        SELECT  * FROM DESCUENTOS
      `);
    const ivas_descuentos = {
      tipos_iva: ivas.recordset,
      descuentos: descuentos.recordset,
    };

    console.log("Desde model:",ivas_descuentos);
    return ivas_descuentos;
  } catch (error) {
    console.error("Error al obtener articulos:", error.message);
    throw error;
  }
};

module.exports = {
  getArticulos,
  get_iva_and_descuento,
};
