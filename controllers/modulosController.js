const modulos = require("../models/modulosModel");

exports.getModulos = async (req, res) => {
  try {
    const modulos = await modulos.obtenerModulos();
    res.status(200).json(modulos);
  } catch (error) {
    console.error("Error al obtener los módulos:", error.message);
    res.status(500).json({ message: "Error interno al obtener los módulos" });
  }
};

exports.createModulo = async (req, res) => {
  try {
    const { nombre, clave_modulo } = req.body;

    if (!nombre || !clave_modulo) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const resultado = await modulos.crearModulo(nombre, clave_modulo);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al crear el módulo:", error.message);
    res.status(500).json({ message: "Error interno al crear el módulo" });
  }
};

exports.getSubmodulos = async (req, res) => {
  try {
    const submodulos = await modulos.obtenerSubmodulos();
    res.status(200).json(submodulos);
  } catch (error) {
    console.error("Error al obtener los submódulos:", error.message);
    res
      .status(500)
      .json({ message: "Error interno al obtener los submódulos" });
  }
};

exports.createSubmodulo = async (req, res) => {
  try {
    const { id_modulo, nombre, clave } = req.body;

    if (!id_modulo || !nombre || !clave) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const resultado = await modulos.crearSubmodulo(id_modulo, nombre, clave);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al crear el submódulo:", error.message);
    res.status(500).json({ message: "Error interno al crear el submódulo" });
  }
};
