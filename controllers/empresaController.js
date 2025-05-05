const {
  getEmpresa,
  getEmpresas,
  getColorPrincipal,
  updateEmpresa,
  updateConfigEmpresa,
} = require("../models/empresaModel");

const { validateCIFFormat, validateCIFUnique } = require("../shared/validator");

const getEmpresasHandler = async (req, res) => {
  try {
    const result = await getEmpresas();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener datos empresa:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const getEmpresaHandler = async (req, res) => {
  try {
    const { id } = req.query;

    const result = await getEmpresa(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener datos empresa:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const getColorPrincipalHandler = async (req, res) => {
  try {
    const { empresa } = req.user;

    const result = await getColorPrincipal(empresa);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener color de empresa:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const updateEmpresaHandler = async (req, res) => {
  try {
    const empresa = req.body;

    // Validar el formato del CIF
    if (!validateCIFFormat(empresa.cif)) {
      return res.status(400).json({ message: "El CIF no es válido." });
    }

    // Verificar si el CIF ya existe en la base de datos
    const isCifUnique = await validateCIFUnique(empresa.cif, empresa.id);
    if (!isCifUnique) {
      return res
        .status(400)
        .json({ message: "Ya existe una empresa con este CIF." });
    }

    const updateResult = await updateEmpresa(empresa);
    res.status(200).json(updateResult);
  } catch (error) {
    console.error("Error al actualizar la empresa:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const updateConfigEmpresaHandler = async (req, res) => {
  try {
    const empresa = req.body;

    // Validar el formato del CIF
    if (!validateCIFFormat(empresa.cif)) {
      return res.status(400).json({ message: "El CIF no es válido." });
    }

    // Verificar si el CIF ya existe en la base de datos
    const isCifUnique = await validateCIFUnique(empresa.cif, empresa.id);
    if (!isCifUnique) {
      return res
        .status(400)
        .json({ message: "Ya existe una empresa con este CIF." });
    }

    const updateResult = await updateConfigEmpresa(empresa);
    res.status(200).json(updateResult);
  } catch (error) {
    console.error("Error al actualizar la empresa:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  getEmpresa: getEmpresaHandler,
  getColorPrincipal: getColorPrincipalHandler,
  updateEmpresa: updateEmpresaHandler,
  updateConfigEmpresa: updateConfigEmpresaHandler,
  getEmpresas: getEmpresasHandler,
};
