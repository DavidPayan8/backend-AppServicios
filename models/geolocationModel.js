async function obtenerDireccionReversa(lat, lng) {
  const API_KEY = process.env.API_KEY_MAPS;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
    }

    const data = await res.json();

    if (data.status !== "OK") {
      console.error("Google Maps API Error:", data.status, data.error_message);
      throw new Error(`Google Maps API Error: ${data.status}`);
    }

    const direccion = data.results?.[0] || null;
    return direccion.formatted_address || "Ubicación no disponible";
  } catch (err) {
    console.error("Error al llamar a Google Maps:", err.message);
    throw new Error("Error al obtener la dirección desde Google Maps");
  }
}

module.exports = {
  obtenerDireccionReversa,
};
