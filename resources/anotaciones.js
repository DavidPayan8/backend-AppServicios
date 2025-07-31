/**
 * Mapea una anotación de la base de datos al formato CalendarEvent esperado por el frontend
 * @param {Object} item - Objeto anotación desde la base de datos
 * @returns {Object} - Objeto formateado tipo CalendarEvent
 */
function mapAnotacionToCalendarEvent(item) {
  const start = item.fecha_hora_anotacion;
  const duracion = item.duracion_estimada > 0 ? item.duracion_estimada : 60; // duración mínima 60min

  const end = new Date(new Date(start).getTime() + duracion * 60 * 1000)
    .toISOString()
    .replace("Z", "");

  return {
    id: item.id.toString(),
    title: item.asunto || "Sin asunto",
    start: new Date(start).toISOString().replace("Z", ""),
    end: end,
    extendedProps: {
      id: item.id,
      descripcion: item.objetivo_anotacion || "",
      tiempo_estimado: duracion,
      responsable: item.usuario_id ?? undefined,
    },
  };
}

module.exports = { mapAnotacionToCalendarEvent };
