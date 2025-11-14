
const estados = ['Pendiente', 'Ofertado', 'Rechazado'];

/**
 * Mapea una solicitud de la base de datos para normalizarlo
 * @param {Object} solicitud - Objeto solicitud desde la base de datos
 * @returns {Object} - Objeto formateado tipo solicitud
 */
function mapSolicitudNomalized(solicitud) {
    return {
        id: solicitud.id,
        fecha_solicitud: solicitud.fecha_solicitud,
        nota: solicitud.nota,
        estado: estados[solicitud.estado] || 'Desconocido',
        peticionario: solicitud.solicitud_peticionario
            ? {
                id: solicitud.solicitud_peticionario.id,
                cliente_id: solicitud.solicitud_peticionario.cliente_id,
                nombre: solicitud.solicitud_peticionario.nombre,
                cargo: solicitud.solicitud_peticionario.cargo,
                telefono_1: solicitud.solicitud_peticionario.telefono_1,
                telefono_2: solicitud.solicitud_peticionario.telefono_2,
                email: solicitud.solicitud_peticionario.email,
            }
            : null,

        cliente: solicitud.solicitud_cliente
            ? {
                id: solicitud.solicitud_cliente.id,
                nombre: solicitud.solicitud_cliente.nombre,
                apellidos: solicitud.solicitud_cliente.apellidos,
                nombre_empresa: solicitud.solicitud_cliente.nombre_empresa,
                email: solicitud.solicitud_cliente.email,
                direccion: solicitud.solicitud_cliente.direccion
            } : null
    };
}

module.exports = { mapSolicitudNomalized };