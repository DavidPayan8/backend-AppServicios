const sql = require("mssql");
const { config } = require("../config/dbConfig");

const getUserByUsername = async (username) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Usuarios WHERE user_name = @username");

    return result.recordset[0];
  } catch (error) {
    console.error("Error al obtener usuario:", error.message);
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
    const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT *
        FROM usuarios
        WHERE id = @id;
        `);

    return result.recordset[0];
  } catch (error) {
    console.error("Error al obtener usuario:", error.message);
    throw error;
  }
};

/**
 *
 * @param {number} id
 * @param {string} nombreApellidos
 * @param {string | null | undefined} password
 * @param {string} dni
 * @param {string} seguidadSocial
 * @param {string | null | undefined} email
 * @param {string | null |undefined}  telefono
 * @returns {void}
 */
const actualizarPerfil = async (
  id,
  nombreApellidos,
  password,
  dni,
  seguidadSocial,
  email,
  telefono,
  sexo
) => {
  try {
    const pool = await sql.connect(config);
    const request = pool
      .request()
      .input("id", sql.Int, id)
      .input("nomapes", sql.VarChar, nombreApellidos)
      .input("DNI", sql.VarChar, dni)
      .input("num_seguridad_social", sql.VarChar, seguidadSocial);

    // Construimos dinámicamente la query
    let setClauses = [
      "nomapes = @nomapes",
      "DNI = @DNI",
      "num_seguridad_social = @num_seguridad_social",
    ];

    if (password) {
      request.input("contrasena", sql.VarChar, password);
      setClauses.push("contrasena = @contrasena");
    }

    if (email != null) {
      request.input("email", sql.VarChar, email);
      setClauses.push("email = @email");
    }

    if (telefono != null) {
      request.input("telefono", sql.VarChar, telefono);
      setClauses.push("telefono = @telefono");
    }

    if (sexo != null) {
      request.input("sexo", sql.VarChar, sexo);
      setClauses.push("sexo = @sexo");
    }

    const query = `
      UPDATE usuarios
      SET ${setClauses.join(", ")}
      WHERE id = @id;
    `;

    const result = await request.query(query);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
  }
};

const actualizarPrimerInicio = async (id) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request().input("id", sql.Int, id).query(`
        UPDATE usuarios
        SET primer_inicio = 0
        WHERE id = @id;
      `);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
  }
};

const getUsers = async (empresa) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("id_empresa", sql.Int, empresa)
      .query("SELECT * FROM Usuarios Where id_empresa = @id_empresa");
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    throw error;
  }
};

module.exports = {
  getUserByUsername,
  getUsers,
  getUserById,
  actualizarPerfil,
  actualizarPrimerInicio,
};
