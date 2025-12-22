// validators.js
const db = require("../Model");
const { Op } = require("sequelize");

// Función para validar el formato del CIF
const validateCIFFormat = (cif) => {
  const cifPattern = /^[A-HJ-NP-SUVW]{1}[0-9]{7}[A-J0-9]{1}$/;
  return cifPattern.test(cif);
};

const validateCIFUnique = async (cif, empresaId = null) => {
  try {
    const whereCondition = empresaId
      ? { cif, id: { [Op.ne]: empresaId } }
      : { cif };

    const count = await db.EMPRESA.count({ where: whereCondition });

    return count === 0;
  } catch (error) {
    console.error("Error al verificar el CIF en la base de datos:", error);
    throw error;
  }
};

module.exports = { validateCIFFormat, validateCIFUnique };
