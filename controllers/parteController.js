const db = require("../Model");
const { obtenerDireccionReversa } = require("../Model/others/geolocationModel");

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
    hora_salida,
    fecha,
    horas_extra,
    horas_festivo,
    observaciones,
  } = req.body;
  const id_usuario = req.user.id;

  try {
    const nuevoParte = await db.PARTES_TRABAJO.create({
      id_usuario,
      id_capitulo,
      id_partida,
      id_proyecto,
      hora_entrada,
      hora_salida,
      fecha,
      horas_extra,
      horas_festivo,
      observaciones,
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
  const { id_proyecto } = req.query;
  const id_usuario = req.user.id;

  const whereClause = { id_usuario };
  if (id_proyecto) whereClause.id_proyecto = id_proyecto;

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
  } = req.body;

  try {
    const [updatedRows] = await db.PARTES_TRABAJO.update(
      {
        id_capitulo,
        id_partida,
        id_proyecto,
        hora_salida,
        horas_festivo,
        horas_extra,
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
      res.status(200).json({ id });
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

const actualizarLocalizacionEntrada = async (req, res) => {
  const { id_parte, localizacion_entrada } = req.body;
  console.log(req.body);

  let direccionFinal = "Ubicación no disponible";

  try {
    if (!id_parte) return res.status(400).json({ message: "Id requerido." });

    if (localizacion_entrada?.error) {
      direccionFinal =
        localizacion_entrada.mensaje || "Ubicación no disponible";
    } else {
      try {
        direccionFinal = await obtenerDireccionReversa(
          localizacion_entrada.lat,
          localizacion_entrada.lng
        );
      } catch (err) {
        console.error("Error al obtener dirección:", err);
      }
    }

    // Actualizar localización
    await db.PARTES_TRABAJO.update(
      { localizacion_entrada: direccionFinal },
      { where: { id: id_parte } }
    );

    res
      .status(200)
      .json({ message: "Localización actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar localización:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

const actualizarLocalizacionSalida = async (req, res) => {
  const { id_parte, localizacion_salida } = req.body;

  let direccionFinal = "Ubicación no disponible";

  try {
    if (!id_parte) return res.status(400).json({ message: "Id requerido." });

    if (localizacion_salida?.error) {
      direccionFinal = localizacion_salida.mensaje || "Ubicación no disponible";
    } else {
      try {
        direccionFinal = await obtenerDireccionReversa(
          localizacion_salida.lat,
          localizacion_salida.lng
        );
      } catch (err) {
        console.error("Error al obtener dirección:", err);
      }
    }

    // Actualizar localización
    await db.PARTES_TRABAJO.update(
      { localizacion_salida: direccionFinal },
      { where: { id: id_parte } }
    );

    res
      .status(200)
      .json({ message: "Localización actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar localización:", error);
    res.status(500).json({ message: "Error del servidor." });
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
  actualizarLocalizacionEntrada,
  actualizarLocalizacionSalida,
};
