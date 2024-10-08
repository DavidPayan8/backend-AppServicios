const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerDiasEditables = async (rol) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("rol", sql.VarChar, rol).query(`
                  SELECT n_dias_editables 
                  FROM CONFIGURACIONES 
                  WHERE rol = @rol 
              `);
      return result.recordset;
    } catch (error) {
      console.error("Error al obtener partes de trabajo:", error.message);
      throw error;
    }
  };

  module.exports = {
    obtenerDiasEditables
  };
  