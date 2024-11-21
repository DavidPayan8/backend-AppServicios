const {
    getArticulos
  } = require("../models/articulosModel");

  const obtenerArticulos = async (req, res) => {
    try {
  
      // Obtener articulos
      const articulos = await getArticulos();
  
      res.status(201).json(articulos);
    } catch (error) {
      console.error("Error al obtener lista articulos:", error.message);
      res.status(500).send("Error del servidor");
    }
  };

  module.exports = {
    obtenerArticulos
  };