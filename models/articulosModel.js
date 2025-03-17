const sql = require("mssql");
const config = require("../config/dbConfig");

let poolPromise;

const connectToDb = async () => {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
};

const getArticulos = async (empresa) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request()
    .input("id_empresa", sql.Int, empresa)
    .query(`
        SELECT *
        From Articulos Where id_empresa = @id_empresa;
`); //Poner limite de articulos.

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener articulos:", error.message);
    throw error;
  }
};

const getVehiculos = async (id_usuario) => {
  try {
    const pool = await connectToDb();
    const result = await pool.request().query(`
        SELECT *
        From Vehiculos
        Where id_usuario = ${id_usuario};
`);

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener vehiculos:", error.message);
    throw error;
  }
};

const get_iva_and_descuento = async (empresa) => {
  try {
    const pool = await connectToDb();
    const ivas = await pool.request()
    .input("id_empresa", sql.Int, empresa)
    .query(`
        SELECT *
        From Tipos_Iva Where id_empresa = @id_empresa;
`);
    const descuentos = await pool.request()
    .input("id_empresa", sql.Int, empresa)
    .query(`
        SELECT  * FROM DESCUENTOS WHERE id_empresa = @id_empresa;
      `);
    const ivas_descuentos = {
      tipos_iva: ivas.recordset,
      descuentos: descuentos.recordset,
    };
    return ivas_descuentos;
  } catch (error) {
    console.error("Error al obtener articulos:", error.message);
    throw error;
  }
};

module.exports = {
  getArticulos,
  getVehiculos,
  get_iva_and_descuento,
};
