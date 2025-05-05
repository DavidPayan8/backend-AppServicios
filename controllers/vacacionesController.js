const {
  obtenerTotalVacaciones,
  obtenerTiposVacacion,
  obtenerVacacionesSolicitadas,
  solicitarVacaciones,
  obtenerVacacionesAceptadas,
  obtenerVacacionesDenegadas,
} = require("../models/vacacionesModel");

const obtenerTotalVacacionesHandler = async (req, res) => {
  try {
    let total = await obtenerTotalVacaciones(req.user.id);
    res.status(200).json(total);
  } catch (error) {
    console.error("Error al obtener total de vacaciones:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerTiposVacacionHandler = async (req, res) => {
  try {
    let tipos = await obtenerTiposVacacion(req.user.empresa);
    res.status(200).json(tipos);
  } catch (error) {
    console.error("Error al obtener tipos de vacacion: ", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerVacacionesSolicitadasHandler = async (req, res) => {
  try {
    const { tipo } = req.body;
    const vacaciones = await obtenerVacacionesSolicitadas(req.user.id, tipo);
    res.status(200).json(vacaciones);
  } catch (error) {
    console.error("Error al obtener vacaciones solicitadas: ", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerVacacionesAceptadasHandler = async (req, res) => {
  try {
    const { tipo } = req.body;
    const vacaciones = await obtenerVacacionesAceptadas(req.user.id, tipo);
    res.status(200).json(vacaciones);
  } catch (error) {
    console.error("Error al obtener vacaciones aceptadas: ", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerVacacionesDenegadasHandler = async (req, res) => {
  try {
    const { tipo } = req.body;
    const vacaciones = await obtenerVacacionesDenegadas(req.user.id, tipo);
    res.status(200).json(vacaciones);
  } catch (error) {
    console.error("Error al obtener vacaciones denegadas: ", error.message);
    res.status(500).send("Error del servidor");
  }
};

const solicitarVacacionesHandler = async (req, res) => {
  try {
    const { tipo, dias } = req.body;
    const err = await solicitarVacaciones(req.user.id, tipo, dias);

    if (!err) {
      res.status(201).json({});
    } else {
      res.json({ err });
    }
  } catch (error) {
    console.error("Error solicitar vacaciones: ", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  obtenerTotalVacaciones: obtenerTotalVacacionesHandler,
  obtenerTiposVacacion: obtenerTiposVacacionHandler,
  obtenerVacacionesAceptadas: obtenerVacacionesAceptadasHandler,
  obtenerVacacionesDenegadas: obtenerVacacionesDenegadasHandler,
  obtenerVacacionesSolicitadas: obtenerVacacionesSolicitadasHandler,
  solicitarVacaciones: solicitarVacacionesHandler,
};
