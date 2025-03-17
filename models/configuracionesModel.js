const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerDiasEditables = async (rol) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("rol", sql.VarChar, rol).query(`
                  SELECT n_dias_editables 
                  FROM CONFIGURACIONES 
                  WHERE rol = @rol 
              `);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener dias_editables:", error.message);
    throw error;
  }
};

const getConfigEmpresa = async (empresa) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
    .input("id_empresa", sql.Int, empresa)
    .query(`SELECT * FROM CONFIG_EMPRESA WHERE id_empresa = @id_empresa`);
    return result.recordset[0];
  } catch (error) {
    console.error("Error al obtener config de empresa:", error.message);
    throw error;
  }
};

module.exports = {
  obtenerDiasEditables,
  getConfigEmpresa,
};
