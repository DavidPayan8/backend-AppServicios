/**
 * Formatea una respuesta paginada estándar para APIs REST
 * @param {Object[]} data - Array de datos
 * @param {number} total - Total de elementos disponibles
 * @param {number} page - Página actual (1-indexado)
 * @param {number} limit - Número de elementos por página
 * @returns {Object} Respuesta paginada formateada
 */
function paginatedResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
  
    return {
      data,
      meta: {
        totalItems: total,
        currentPage: page,
        totalPages,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
  
  module.exports = { paginatedResponse };