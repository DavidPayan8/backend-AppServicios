function formatOrdenTrabajo(data) {
    const cliente = {
        id: data.cliente_ot?.id || 0,
        nombre: data.cliente_ot?.nombre || "",
        nombre_empresa: data.cliente_ot?.nombre_empresa || null,
        email: data.cliente_ot?.email || null,
        direccion: data.cliente_ot?.direccion || null,
        peticionario: data.peticionario || "",
    };

    // Primer parte de hoy, si existe
    const primerParteHoy = data.partes_trabajo && data.partes_trabajo.length > 0
        ? data.partes_trabajo[0]
        : null;

    return {
        id: data.id,
        num_ot: data.num_ot,
        nombre: data.nombre,
        observaciones: data.observaciones,
        estado: data.estado,
        direccion: data.direccion,
        transporte: data.transporte,
        horas_concedidas: data.horas_concedidas,
        fecha_limite: data.fecha_limite,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        cliente,
        parteHoy: primerParteHoy?.hora_entrada || null,
    };
}

function mapformatOrdenesTrabajo(data) {
    return data.map(d => formatOrdenTrabajo(d));
}

module.exports = { mapformatOrdenesTrabajo, formatOrdenTrabajo };
