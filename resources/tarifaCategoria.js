/**
 * Convierte un registro de Sequelize TARIFAS_CATEGORIAS a un objeto limpio
 * con los tipos que queremos enviar al frontend.
 * @param {Object} tarifa - Registro de Sequelize
 * @returns {Object} Objeto parseado
 */
const resourceTarifaCategoria = (tarifa) => {
    return {
        id: tarifa.id_tarifa,
        id_grupo: tarifa.id_grupo,
        id_empresa: tarifa.id_empresa ?? null,
        horas_jornada: Number(tarifa.horas_jornada),
        salario_base: Number(tarifa.salario_base),
        fecha_inicio: tarifa.fecha_inicio || null,
        fecha_fin: tarifa.fecha_fin || null,
        categoriaLaboral: tarifa.categoriaLaboral
            ? {
                id: tarifa.categoriaLaboral.id,
                nombre: tarifa.categoriaLaboral.nombre,
            }
            : null,
    };
};

/**
 * Convierte un array de registros
 * @param {Array} tarifas 
 * @returns {Array}
 */
const mapTarifasCategorias = (tarifas) => tarifas.map(resourceTarifaCategoria);

module.exports = {
    resourceTarifaCategoria,
    mapTarifasCategorias,
};