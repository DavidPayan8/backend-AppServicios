const {
  getIdProyectos,
  getProyectos,
  addProyecto,
  cambiarEstadoProyecto,
  getContrato,
  getIdContrato,
  getDetallesContrato
} = require("../models/proyectosModel");

const obtenerIdProyectos = async (req, res) => {
  const userId = req.user.id; // Obtener el ID del usuario desde el token de autenticación
  const { date } = req.query;

  try {
    const idProyectos = await getIdProyectos(userId, date);

    res.status(200).json(idProyectos);
  } catch (error) {
    console.error("Error al obtener los id de los proyectos:", error.message);
    res.status(500).json({
      message: "Error del servidor al obtener los partes del usuario.",
    });
  }
};
const cambiarEstado = async (req, res) => {
  try {
    const { id, estado } = req.body;

    // Cambiar estado del proyecto
    await cambiarEstadoProyecto(id, estado);

    res.status(201);
  } catch (error) {
    console.error("Error al crear proyecto:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerProyectosPorIds = async (req, res) => {
  const { ids } = req.body;
  try {
    const proyectos = await getProyectos(ids);

    res.status(200).json(proyectos);
  } catch (error) {
    console.error("Error al obtener los proyectos por IDs:", error.message);
    res.status(500).json({
      message: "Error del servidor al obtener los proyectos por IDs.",
    });
  }
};

const crearProyecto = async (req, res) => {
  try {
    const { nombre, observaciones, id_cliente, fechaCalendario, es_ote } =
      req.body;
    const id_usuario = req.user.id;

    // Crear el proyecto y calendario
    const nuevoProyecto = await addProyecto(
      nombre,
      observaciones,
      id_usuario,
      id_cliente,
      fechaCalendario,
      es_ote
    );

    res.status(201).json({
      mensaje: "Proyecto y calendario creados exitosamente",
      proyectoId: nuevoProyecto.id,
    });
  } catch (error) {
    console.error("Error al crear proyecto:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerContrato = async (req, res) => {

  try {
    const { orden_trabajo_id } = req.body;
    
    const id_contrato = await getIdContrato(orden_trabajo_id);

    const cabecera = await getContrato(id_contrato);

    const detalles = await getDetallesContrato(id_contrato);

    const contrato = {cabecera, detalles}
    res.status(200).json(contrato);
  } catch (error) {
    console.error("Error al obtener contrato:", error.message);
    res.status(500).json({message: "Error en el servidor", data: null})
  }
};

const obtenerProyecto = async (req, res) => {
  try {
    const { id } = req.body;

    // Obtener proyecto por Id
    const proyecto = await getProyectos(id);

    res.status(200).json(proyecto[0]);
  } catch (error) {
    console.error("Error obtener proyecto:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  obtenerIdProyectos,
  obtenerProyectosPorIds,
  crearProyecto,
  obtenerProyecto,
  cambiarEstado,
  obtenerContrato,
  getDetallesContrato,
};
