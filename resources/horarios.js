// resources/jornadaResource.js

function mapTramo(tramo) {
    return {
      descripcion: tramo.descripcion,
      hora_inicio: tramo.hora_inicio,
      hora_fin: tramo.hora_fin,
      dias: tramo.detallesDias
        ? tramo.detallesDias.map(d => d.dia_semana)
        : []
    };
  }
  
  function mapJornada(jornada) {
    return {
      id: jornada.id_horario,
      nombre: jornada.nombre,
      descripcion: jornada.descripcion,
      id_empresa: jornada.id_empresa,
      fecha_inicio: jornada.fecha_inicio,
      fecha_fin: jornada.fecha_fin,
      activo: jornada.activo,
      grupos: jornada.grupos ? jornada.grupos.map(g => g.id_grupo) : [],
      tramos: jornada.tramos ? jornada.tramos.map(mapTramo) : []
    };
  }
  
  module.exports = { mapJornada };
  