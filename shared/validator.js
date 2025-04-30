// validators.js

const sql = require("mssql");
const config = require("../config/dbConfig");

// Función para validar el formato del CIF
const validateCIFFormat = (cif) => {
  const cifPattern = /^[A-HJ-NP-SUVW]{1}[0-9]{7}[A-J0-9]{1}$/;
  return cifPattern.test(cif);
};

// Función para verificar que el CIF sea único en la base de datos
const validateCIFUnique = async (cif, empresa) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("cif", sql.NVarChar, cif)
      .input("empresa", sql.Int, empresa)
      .query(
        "SELECT COUNT(*) AS count FROM empresa WHERE cif = @cif and id_empresa <> @empresa"
      );

    return result.recordset[0].count === 0;
  } catch (error) {
    console.error(
      "Error al verificar el CIF en la base de datos:",
      error.message
    );
    throw new Error("Error en la validación del CIF.");
  }
};

module.exports = { validateCIFFormat, validateCIFUnique };
