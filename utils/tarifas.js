const { Op } = require("sequelize");
const db = require("../Model");

/**
 * Comprueba si una nueva tarifa se solapa con tarifas existentes del mismo grupo.
 *
 * @param {Object[]} tarifasExistentes - Tarifas existentes en la BD
 * @param {Date} nuevaInicio - Fecha de inicio de la nueva tarifa
 * @param {Date|null} nuevaFin - Fecha de fin de la nueva tarifa (puede ser null)
 * @returns {boolean} true si hay solapamiento
 */
function haySolapamiento(tarifasExistentes, nuevaInicio, nuevaFin) {
  return tarifasExistentes.some(t => {
    const tInicio = new Date(t.fecha_inicio);
    const tFin = t.fecha_fin ? new Date(t.fecha_fin) : null;

    // 🔍 Casos de solapamiento
    if (!tFin && !nuevaFin) return true; // Ambas abiertas
    if (!tFin && nuevaFin && nuevaFin >= tInicio) return true;
    if (tFin && !nuevaFin && nuevaInicio <= tFin) return true;
    if (tFin && nuevaFin && tInicio <= nuevaFin && nuevaInicio <= tFin) return true;

    return false;
  });
}

/**
 * Busca tarifas existentes del mismo grupo (y empresa) para verificar solapamientos.
 *
 * @param {Object} db - Instancia de Sequelize con los modelos
 * @param {number} id_grupo - ID de la categoría laboral
 * @param {number} id_empresa - ID de la empresa
 * @param {number|null} [excluirId=null] - ID de la tarifa a excluir (en updates)
 */
async function obtenerTarifasExistentes(db, id_grupo, id_empresa, excluirId = null) {
  const where = {
    id_grupo,
    id_empresa,
  };

  if (excluirId) {
    where.id_tarifa = { [Op.ne]: excluirId };
  }

  return await db.TARIFAS_CATEGORIAS.findAll({ where });
}

module.exports = { haySolapamiento, obtenerTarifasExistentes };
