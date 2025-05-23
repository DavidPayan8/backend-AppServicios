const {
  obtenerModulos,
  crearModulo,
  crearSubmodulo,
  actualizarModulosEmpresa,
} = require("../models/modulosModel");

const getModulos = async (req, res) => {
  const { id_empresa } = req.query;
  try {
    const modulos = await obtenerModulos(id_empresa);
    res.status(200).json(modulos);
  } catch (error) {
    console.error("Error al obtener los módulos:", error.message);
    res.status(500).json({ message: "Error interno al obtener los módulos" });
  }
};

const createModulo = async (req, res) => {
  try {
    const { nombre, clave_modulo } = req.body;

    if (!nombre || !clave_modulo) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const resultado = await crearModulo(nombre, clave_modulo);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al crear el módulo:", error.message);
    res.status(500).json({ message: "Error interno al crear el módulo" });
  }
};

const createSubmodulo = async (req, res) => {
  try {
    const { id_modulo, nombre, clave } = req.body;

    if (!id_modulo || !nombre || !clave) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const resultado = await crearSubmodulo(id_modulo, nombre, clave);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al crear el submódulo:", error.message);
    res.status(500).json({ message: "Error interno al crear el submódulo" });
  }
};

const updateModulosEmpresa = async (req, res) => {
  const { id_empresa, modulos } = req.body;

  try {
    await actualizarModulosEmpresa(id_empresa, modulos);
    res.status(200).json({ message: "Modulos actualizados" });
  } catch (error) {
    console.error("Error al actualizar modulos:", error.message);
    res.status(500).json({ error: "Error al actualizar modulos" });
  }
};

module.exports = {
  getModulos,
  createModulo,
  createSubmodulo,
  updateModulosEmpresa,
};
