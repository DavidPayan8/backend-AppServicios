const db = require("../Model");
const { Op } = require("sequelize");

/**
 * Verifica si la empresa ha alcanzado su límite de usuarios
 * @param {number} idEmpresa - ID de la empresa a verificar
 * @returns {Promise<{permitido: boolean, mensaje?: string}>} 
 *          - permitido: true si puede crear más usuarios, false si alcanzó el límite
 *          - mensaje: mensaje de error si alcanzó el límite
 */
const verificarLimiteUsuarios = async (idEmpresa) => {
    try {
        // Obtener configuración de la empresa
        const configEmpresa = await db.CONFIG_EMPRESA.findOne({
            where: { id_empresa: idEmpresa }
        });

        // Obtener el límite de usuarios
        const limiteUsuarios = configEmpresa?.limite_usuarios;

        // Si es null o undefined, no hay límite (ilimitado)
        if (limiteUsuarios === null || limiteUsuarios === undefined) {
            return { permitido: true };
        }

        // Contar usuarios actuales de la empresa
        const cantidadUsuarios = await db.USUARIOS.count({
            where: { id_empresa: idEmpresa, rol: { [Op.ne]: "superadmin" } }
        });

        // Verificar si se alcanzó el límite
        if (cantidadUsuarios >= limiteUsuarios) {
            return {
                permitido: false,
                message: `Límite de usuarios alcanzado. Máximo permitido: ${limiteUsuarios}`
            };
        }

        return { permitido: true };
    } catch (error) {
        console.error("Error al verificar límite de usuarios:", error);
        throw error;
    }
};

module.exports = {
    verificarLimiteUsuarios
};
