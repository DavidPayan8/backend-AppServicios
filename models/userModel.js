const sql = require('mssql');
const config = require('../config/dbConfig');

const getUserByUsername = async (username) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM Usuarios WHERE user_name = @username');
    return result.recordset[0];
  } catch (error) {
    console.error('Error al obtener usuario:', error.message);
    throw error;
  }
};

const getUsers = async () => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT * FROM Usuarios');
    return result.recordset;
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    throw error;
  }
};

module.exports = {
  getUserByUsername,
  getUsers
};