const db = require("../Model");
const { obtenerDireccionReversa } = require("../models/geolocationModel");

const checkParteAbierto = async (req, res) => {
  const { id_proyecto } = req.query;
  const id_usuario = req.user.id;

  try {
    const parteAbierto = await db.PARTES_TRABAJO.findOne({
      where: {
        id_usuario,
        id_proyecto,
        hora_salida: null,
      },
    });

    res.status(200).json({ abierto: !!parteAbierto });
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
  let direccionFinal = null;

  try {
    if (localizacion?.error) {
      // Si viene error, guardamos el mensaje como ubicación
      direccionFinal = localizacion.mensaje || "Ubicación no disponible";
    } else {
      // Si hay coordenadas, hacemos geolocalización inversa
      direccionFinal = await obtenerDireccionReversa(
        localizacion.lat,
        localizacion.lng
      );
    }

    const nuevoParte = await db.PARTES_TRABAJO.create({
      id_usuario,
      id_capitulo,
      id_partida,
      id_proyecto,
      hora_entrada,
      fecha,
      localizacion_entrada: direccionFinal,
      horas_extra,
      horas_festivo,
    });

    res.status(201).json({ id: nuevoParte.id });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear parte de trabajo.",
      error: error.message,
    });
  }
};

const getPartes = async (req, res) => {
  const { id_proyecto, fecha } = req.query;
  const id_usuario = req.user.id;

  const whereClause = { id_usuario };
  if (id_proyecto) whereClause.id_proyecto = id_proyecto;
  if (fecha) whereClause.fecha = fecha;

  try {
    const partes = await db.PARTES_TRABAJO.findAll({
      where: whereClause,
    });

    res.status(200).json(partes);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener partes de trabajo.",
      error: error.message,
    });
  }
};

const getParte = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.user.id;

  try {
    const parte = await db.PARTES_TRABAJO.findOne({
      where: { id, id_usuario },
    });
    res.status(200).json(parte);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener parte de trabajo.",
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
    localizacion,
  } = req.body;
  let direccionFinal = null;

  try {
    if (localizacion?.error) {
      // Si viene error, guardamos el mensaje como ubicación
      direccionFinal = localizacion.mensaje || "Ubicación no disponible";
    } else {
      // Si hay coordenadas, hacemos geolocalización inversa
      direccionFinal = await obtenerDireccionReversa(
        localizacion.lat,
        localizacion.lng
      );
    }

    const [updatedRows] = await db.PARTES_TRABAJO.update(
      {
        id_capitulo,
        id_partida,
        id_proyecto,
        hora_salida,
        horas_festivo,
        horas_extra,
        localizacion_salida: direccionFinal,
      },
      {
        where: { id },
      }
    );

    if (updatedRows === 0) {
      res.status(404).json({
        message: "No se encontró el parte de trabajo para actualizar.",
      });
    } else {
      res
        .status(200)
        .json({ message: "Parte de trabajo actualizado correctamente." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el parte de trabajo.",
      error: error.message,
    });
  }
};

const getCapitulos = async (req, res) => {
  const { id_proyecto } = req.query;

  try {
    const capitulos = await db.CAPITULOS.findAll({
      where: { id_proyecto },
    });

    res.status(200).json(capitulos);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener capítulos.",
      error: error.message,
    });
  }
};

const getPartidas = async (req, res) => {
  const { id_capitulo, id_proyecto } = req.query;

  try {
    const partidas = await db.PARTIDAS.findAll({
      where: {
        id_capitulo,
        id_proyecto,
      },
    });

    if (partidas.length > 0) {
      res.status(200).json(partidas);
    } else {
      res.status(404).json({
        message: "No se encontraron partidas para los criterios especificados.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener partidas.",
      error: error.message,
    });
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
