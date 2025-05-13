async function obtenerDireccionReversa(lat, lng) {
  const API_KEY = process.env.API_KEY_MAPS;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const direccion = data.results?.[0] || null;
    return direccion;
  } catch (err) {
    console.error("Error al llamar a Google Maps:", err.message);
    throw new Error("Error al obtener la dirección desde Google Maps");
  }
}

module.exports = {
  obtenerDireccionReversa,
};
