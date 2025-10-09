/**
 * Transforma un fichaje de Sequelize a un objeto limpio para frontend
 * Prioriza horas_personalizadas sobre la tarifa de la categoría laboral
 */
function fichajeResource(f) {
  const tarifa = f.usuario.categoriaLaboral?.tarifas?.[0];
  const horasDiarias = f.usuario.horas_personalizadas ?? tarifa?.horas_jornada ?? null;

  return {
    Id: f.Id,
    Fecha: f.Fecha,
    Entrada: f.Entrada,
    Salida: f.Salida,
    Total: f.Total,
    Ubicacion_entrada: f.Ubicacion_entrada,
    Ubicacion_salida: f.Ubicacion_salida,
    Trabajador: f.usuario.nomapes,
    Rol: f.usuario.rol,
    HorasDiarias: horasDiarias
  };
}
  
  /**
   * Mapea un array de fichajes
   */
  function mapfichajeResource(fichajes) {
    return fichajes.map(fichajeResource);
  }
  
  module.exports = {
    fichajeResource,
    mapfichajeResource
  };
  