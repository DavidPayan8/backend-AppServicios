const {
  cambiarDetallesDoc,
  crearDetallesDoc,
  borrarDetalleDoc,
} = require("../models/albaranModel");

const cambiarDetalleAlbaran = async (req, res) => {
  try {
    const { id, details } = req.body;

    // Obtener listado articulos por Id de la Orden Trabajo
    const result = await cambiarDetallesDoc(id, details);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error al cambiar detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const crearDetalleAlbaran = async (req, res) => {
  try {
    const { id, details, cabecera} = req.body;

    // Si no tiene cabecera, crea una nueva.
    if(!details.cabecera_id){
        const cabecera_id = await crearCabeceraDoc(cabecera)
        details.cabecera_id = cabecera_id;
    }

    // Obtener listado articulos por Id de la Orden Trabajo.
    const result = await crearDetallesDoc(id, details);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error al crear detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const borrarDetalleAlbaran = async (req, res) => {
  try {
    const { id, details } = req.body;

    // Obtener listado articulos por Id de la Orden Trabajo.
    const result = await borrarDetalleDoc(id, details);

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
};