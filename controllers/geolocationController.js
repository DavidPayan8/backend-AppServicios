const { obtenerDireccionReversa } = require("../Model/others/geolocationModel");

async function geocodificar(req, res) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Faltan coordenadas" });
  }

  try {
    const direccion = await obtenerDireccionReversa(lat, lng);

    res.status(200).json({ direccion: direccion.formatted_address });
  } catch (err) {
    res.status(500).json({ error: "No se pudo obtener la dirección" });
  }
}

module.exports = {
  geocodificar,
};
