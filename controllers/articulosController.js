const {
    getArticulosPorOt
  } = require("../models/articulosModel");

  const obtenerArticulosPorOt = async (req, res) => {
    try {
      const { id } = req.body;
  
      // Obtener listado articulos por Id de la Orden Trabajo
      const articulos = await getArticulosPorOt(id);
  
      res.status(201).json(articulos);
    } catch (error) {
      console.error("Error al obtener lista articulos:", error.message);
      res.status(500).send("Error del servidor");
    }
  };

  module.exports = {
    obtenerArticulosPorOt
  };