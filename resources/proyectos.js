function formatOrdenTrabajo(data) {

    const cliente = {
        id: data.cliente_ot?.id || 0,
        nombre: data.cliente_ot?.nombre || "",
        nombre_empresa: data.cliente_ot?.nombre_empresa || null,
        email: data.cliente_ot?.email || null,
        direccion: data.cliente_ot?.direccion || null,
        peticionario: data.peticionario || "",
    };

    return {
        id: data.id,
        id_origen: data.id_origen,
        num_ot: data.num_ot,
        nombre: data.nombre,
        observaciones: data.observaciones,
        estado: data.estado,
        direccion: data.direccion,
        transporte: data.transporte,
        seccion_id: data.seccion_id_origen,
        id_servicio_origen: data.id_servicio_origen,
        horas_concedidas: data.horas_concedidas,
        fecha_limite: data.fecha_limite,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        cliente,
        sumHorasHoy: data.sumHorasHoy,
    };
}

function mapformatOrdenesTrabajo(data) {
    return data.map(d => formatOrdenTrabajo(d));
}

module.exports = { mapformatOrdenesTrabajo, formatOrdenTrabajo };
