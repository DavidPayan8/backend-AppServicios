const parteService = require("../models/parteModel");

const checkParteAbierto = async (req, res) => {
  const { id_proyecto } = req.body;
  const id_usuario = req.user.id;

  try {
    const hayParteAbierto = await parteService.checkParteAbierto(
      id_usuario,
      id_proyecto
    );

    if (hayParteAbierto) {
      res.status(200).json(hayParteAbierto);
    } else {
      res.status(200).json(hayParteAbierto);
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al comprobar partes abiertos.",
      error: error.message,
    });
  }
};

const crearParteTrabajo = async (req, res) => {
  const {
    id_capitulo,
    id_partida,
    id_proyecto,
    hora_entrada,
    fecha,
    localizacion,
    horas_extra,
    horas_festivo,
  } = req.body;
  const id_usuario = req.user.id;

  try {
    const newParteId = await parteService.crearParteTrabajo({
      id_usuario,
      id_capitulo,
      id_partida,
      id_proyecto,
      hora_entrada,
      fecha,
      localizacion,
      horas_extra,
      horas_festivo,
    });
    res.status(201).json({ id: newParteId });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear parte de trabajo.",
      error: error.message,
    });
  }
};

const getPartes = async (req, res) => {
  const { id_proyecto, fecha } = req.body;
  const id_usuario = req.user.id;

  try {
    const partes = await parteService.getPartes(id_usuario, id_proyecto, fecha);

    if (partes.length > 0) {
      res.status(200).json(partes);
    } else {
      res.status(404).json({
        message:
          "No se encontraron partes de trabajo para los criterios especificados.",
      });
    }
  } catch (error) {
    console.error("Error al obtener partes de trabajo:", error.message);
    res.status(500).json({
      message: "Error al obtener partes de trabajo.",
      error: error.message,
    });
  }
};

const getParte = async (req, res) => {
  const { id_parte } = req.body;
  const id_usuario = req.user.id;

  try {
    const parte = await parteService.getParte(id_parte, id_usuario);

    if (parte.length == 1) {
      res.status(200).json(parte);
    } else {
      res.status(404).json({
        message:
          "No se encontraron partes de trabajo para los criterios especificados.",
      });
    }
  } catch (error) {
    console.error("Error al obtener partes de trabajo:", error.message);
    res.status(500).json({
      message: "Error al obtener partes de trabajo.",
      error: error.message,
    });
  }
};

const actualizarParteTrabajo = async (req, res) => {
  const { id } = req.params;
  const {
    id_capitulo,
    id_partida,
    id_proyecto,
    hora_salida,
    horas_festivo,
    horas_extra,
  } = req.body;

  try {
    await parteService.actualizarParteTrabajo(
      id,
      id_capitulo,
      id_partida,
      id_proyecto,
      hora_salida,
      horas_festivo,
      horas_extra
    );
    res
      .status(200)
      .json({ message: "Parte de trabajo actualizado correctamente." });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el parte de trabajo.",
      error: error.message,
    });
  }
};

const getCapitulos = async (req, res) => {
  const { id_proyecto } = req.body;

  try {
    const capitulos = await parteService.getCapitulos(id_proyecto);
    res.status(200).json(capitulos);
  } catch (error) {
    console.error("Error al obtener capitulos:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener capitulos.", error: error.message });
  }
};

const getPartidas = async (req, res) => {
  const { id_capitulo, id_proyecto } = req.body;

  try {
    const partidas = await parteService.getPartidas(id_capitulo, id_proyecto);

    if (partidas.length > 0) {
      res.status(200).json(partidas);
    } else {
      res.status(404).json({
        message: "No se encontraron partidas para los criterios especificados.",
      });
    }
  } catch (error) {
    console.error("Error al obtener partidas:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener partidas.", error: error.message });
  }
};

module.exports = {
  checkParteAbierto,
  crearParteTrabajo,
  getPartes,
  getParte,
  actualizarParteTrabajo,
  getCapitulos,
  getPartidas,
};
