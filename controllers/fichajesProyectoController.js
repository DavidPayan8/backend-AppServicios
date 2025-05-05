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

const eliminarFichajes = async (req, res) => {
  try {
    const { ids } = req.query;
    const idsArray = Array.isArray(ids)
      ? ids.map((id) => parseInt(id))
      : [parseInt(ids)];
    if (idsArray.some(isNaN)) {
      return res.status(400).json({ error: "IDs deben ser números" });
    }
    const result = await fichajesProyectoModel.eliminarFichajes(idsArray);
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "Fichajes eliminados correctamente" });
    } else {
      res.status(404).json({ message: "Fichajes no encontrados" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al eliminar los fichajes: " + error.message });
  }
};

const patchFichaje = async (req, res) => {
  try {
    const {
      id,
      fecha,
      horaEntrada,
      horaSalida,
      localizacionEntrada,
      localizacionSalida,
    } = req.query;
    const result = await fichajesProyectoModel.patchFichaje(
      id,
      fecha,
      horaEntrada,
      horaSalida,
      localizacionEntrada,
      localizacionSalida
    );
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "Fichaje actualizado correctamente" });
    } else {
      res.status(404).json({ message: "Fichaje no encontrado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar el fichaje: " + error.message });
  }
};

const postFichaje = async (req, res) => {
  try {
    const {
      idUsuario,
      entrada,
      salida,
      localizacionEntrada,
      localizacionSalida,
    } = req.query;
    const entradaDate = new Date(entrada);
    const salidaDate = salida ? new Date(salida) : null;
    const result = await fichajesProyectoModel.postFichaje(
      idUsuario,
      entradaDate,
      salidaDate,
      localizacionEntrada,
      localizacionSalida
    );
    res
      .status(201)
      .json({ message: "Fichaje creado correctamente", id: result.insertId });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Controller: Error al crear el fichaje: " + error.message,
      });
  }
};

module.exports = {
  obtenerFichajesProyecto,
  eliminarFichajes,
  patchFichaje,
  postFichaje,
};
