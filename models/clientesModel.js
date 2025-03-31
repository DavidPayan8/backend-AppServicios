const sql = require('mssql');
const config = require('../config/dbConfig');

const getClientes = async () => {
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
      .query('SELECT * FROM CLIENTES');
      return result.recordset;
    } catch (error) {
      console.error('Error al obtener clientes:', error.message);
      throw error;
    }
  };

module.exports = {
    getClientes
};