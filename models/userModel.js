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

/**
 * 
 * @param {number} id 
 * @returns {object}
 */
const getUserById = async (id) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT *
        FROM usuarios
        WHERE id = @id;
        `);

    return result.recordset[0];
  } catch (error) {
    console.error('Error al obtener usuario:', error.message);
    throw error;
  }
}

/**
 * 
 * @param {number} id 
 * @param {string} nombreApellidos 
 * @param {string | null | undefined} password 
 * @param {string} dni 
 * @param {string} seguidadSocial 
 */
const actualizarPerfil = async (id, nombreApellidos, password, dni, seguidadSocial) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("id", sql.Int, id)
      .input("nomapes", sql.VarChar, nombreApellidos)
      .input("contrasena", sql.VarChar, password)
      .input("DNI", sql.VarChar, dni)
      .input("num_seguridad_social", sql.VarChar, seguidadSocial)
      .query(`
        UPDATE usuarios
        SET
          nomapes = @nomapes,
          ${password ? 'contrasena = @contrasena,' : ''}
          DNI = @DNI,
          num_seguridad_social = @num_seguridad_social
        WHERE id = @id;
        `);
      
      console.log(result);
  } catch (error) {
    console.error('Error al actualizar perfil:', error.message);
    throw error;
  }
}

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
  getUsers,
  getUserById,
  actualizarPerfil,
};