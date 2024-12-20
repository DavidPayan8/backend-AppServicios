const {
    getArticulos,
    get_iva_and_descuento,
    getVehiculos
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

  const obtenerVehiculos = async (req, res) => {
    try {
      const {id_usuario} = req.body;

      // Obtener articulos
      const vehiculos = await getVehiculos(id_usuario);
  
      res.status(201).json(vehiculos);
    } catch (error) {
      console.error("Error al obtener vehiculos:", error.message);
      res.status(500).send("Error del servidor");
    }
  };

  const get_iva_descuento = async (req, res) => {
    try {
  
      // Obtener articulos
      const result = await get_iva_and_descuento();
  
      res.status(201).json(result);
    } catch (error) {
      console.error("Error al obtener porcentajes:", error.message);
      res.status(500).send("Error del servidor");
    }
  };

  module.exports = {
    obtenerArticulos,
    obtenerVehiculos,
    get_iva_descuento
  };