const { getEmpresa, getColorPrincipal } = require("../models/empresaModel");

const getEmpresaHandler = async (req, res) => {
  try {
    const { empresa } = req.user;

    const result = await getEmpresa(empresa);
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
    const { empresa } = req.user;

    const result = await getColorPrincipal(empresa);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener color de empresa:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  getEmpresa: getEmpresaHandler,
  getColorPrincipal: getColorPrincipalHandler,
  updateEmpresa: updateEmpresaHandler,
};
