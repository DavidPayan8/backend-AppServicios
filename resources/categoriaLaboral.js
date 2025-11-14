/**
 * @typedef {Object} TarifaCategoriaShort
 * @property {number} id
 * @property {number} salario_base
 * @property {number} horas_jornada
 * @property {string} fecha_inicio
 * @property {string|null} [fecha_fin]
 */

/**
 * @typedef {Object} CategoriaLaboralResource
 * @property {number} id
 * @property {string} nombre
 * @property {string} [codigo_rol]
 * @property {TarifaCategoriaShort[]} tarifa
 */

/**
 * Transforma una categoría laboral de Sequelize al recurso esperado.
 * @param {any} categoria - Instancia de CATEGORIA_LABORAL (con include de tarifas).
 * @returns {CategoriaLaboralResource}
 */
const categoriaLaboralResource = (categoria) => ({
    id: categoria.id,
    nombre: categoria.nombre,
    codigo_rol: categoria.codigo_rol,
    tarifa: categoria.tarifas && categoria.tarifas.length > 0
        ? {
            id: categoria.tarifas[0].id,
            salario_base: categoria.tarifas[0].salario_base,
            horas_jornada: categoria.tarifas[0].horas_jornada,
            fecha_inicio: categoria.tarifas[0].fecha_inicio,
            fecha_fin: categoria.tarifas[0].fecha_fin
        }
        : null
});

/**
 * Transforma un array de categorías laborales
 * @param {any[]} categorias
 * @returns {CategoriaLaboralResource[]}
 */
const categoriaLaboralCollection = (categorias) =>
    categorias.map(categoriaLaboralResource);

module.exports = {
    categoriaLaboralResource,
    categoriaLaboralCollection
};
