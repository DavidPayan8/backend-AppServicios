const {
  cambiarDetallesDoc,
  crearDetallesDoc,
  borrarDetalleDoc,
  obtenerDetallesDocDb,
  crearCabeceraDoc,
  obtenerCabeceraDoc,
} = require("../models/albaranModel");

const obtenerCabeceraOt = async (req, res) => {
  try {
    const { id, cabecera } = req.body;

    // Obtener listado articulos por Id de la Orden Trabajo
    const result = await obtenerCabeceraDoc(id);

    if (result[0]) {
      res.status(201).json(result[0]);
    } else {
      const cabeceraCreada = await crearCabeceraDoc(cabecera);
      res.status(201).json(cabeceraCreada);
    }
  } catch (error) {
    console.error("Error al obtener cabecera doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerDetallesDoc = async (req, res) => {
  try {
    const { id } = req.body;

    // Obtener listado articulos por Id de la Orden Trabajo
    const result = await obtenerDetallesDocDb(id);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error al obtener detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const cambiarDetalleAlbaran = async (req, res) => {
  try {
    const { detallesDoc } = req.body;

    // Obtener listado articulos por Id de la Orden Trabajo
    const result = await cambiarDetallesDoc(detallesDoc);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error al cambiar detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const crearDetalleAlbaran = async (req, res) => {
  try {
    const details = req.body;

    // Obtener listado articulos por Id de la Orden Trabajo.
    const result = await crearDetallesDoc( details);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error al crear detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const borrarDetalleAlbaran = async (req, res) => {
  try {
    const { id } = req.body;

    // Borrar linea de detalle
    const result = await borrarDetalleDoc(id);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error al borrar detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  cambiarDetalleAlbaran,
  crearDetalleAlbaran,
  borrarDetalleAlbaran,
  obtenerCabeceraOt,
  obtenerDetallesDoc
};
