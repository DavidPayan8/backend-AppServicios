function validarTramos(tramos = []) {
    for (let i = 0; i < tramos.length; i++) {
      for (let j = i + 1; j < tramos.length; j++) {
        const a = tramos[i];
        const b = tramos[j];
  
        // Si comparten días
        const diasComunes = a.dias?.filter(d => b.dias?.includes(d)) || [];
        if (diasComunes.length > 0) {
          // Si se solapan en horas
          if (a.hora_inicio < b.hora_fin && a.hora_fin > b.hora_inicio) {
            return {
              valido: false,
              error: `El turno "${a.descripcion}" se solapa con "${b.descripcion}" en los días ${diasComunes.join(", ")}`
            };
          }
        }
      }
    }
    return { valido: true };
  }
  
  module.exports = { validarTramos };