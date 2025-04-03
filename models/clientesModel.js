const sql = require('mssql');
const config = require('../config/dbConfig');

const getClientes = async (empresa) => {
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
      .input("id_empresa", sql.Int, empresa)
      .query('SELECT * FROM CLIENTES where id_empresa = @id_empresa');
      return result.recordset;
    } catch (error) {
      console.error('Error al obtener clientes:', error.message);
      throw error;
    }
  };

module.exports = {
    getClientes
};