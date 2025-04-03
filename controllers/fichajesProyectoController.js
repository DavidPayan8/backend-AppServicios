const fichajesProyectoModel = require("../models/fichajesProyectoModel");

const obtenerFichajesProyecto = async (req, res) => {
  try {
    const { desde, hasta, trabajador, rol } = req.query;
    const fichajes = await fichajesProyectoModel.obtenerFichajesProyecto(
      desde ? new Date(desde) : null,
      hasta ? new Date(hasta) : null,
      trabajador || null,
      rol || null
    );
    res.status(200).json(fichajes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los fichajes" });
  }
};

module.exports = {
  obtenerFichajesProyecto,
};
