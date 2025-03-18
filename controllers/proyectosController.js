const {
  getObras,
  getIdProyectos,
  getProyectos,
  addProyecto,
  cambiarEstadoProyecto,
  getContrato,
  getIdContrato,
  getDetallesContrato,
  createOtObra,
} = require("../models/proyectosModel");

const obtenerObras = async (req, res) => {
  try {
    const empresa = req.user.empresa;

    const obras = await getObras(empresa);

    res.status(200).json(obras);
  } catch (error) {
    console.error("Error al obtener las obras", error.message);
    res.status(500).json({
      message: "Error del servidor al obtener las obras",
    });
  }
};

const crearOtObra = async (req, res) => {
  try {
    const { nombre, id_cliente, id_obra, fechaCalendario, es_ote } = req.body;
    const empresa = req.user.empresa;
    const id_usuario = req.user.id;

    // Crear el proyecto y calendario
    const nuevoProyecto = await createOtObra(
      id_usuario,
      nombre,
      id_cliente,
      id_obra,
      fechaCalendario,
      es_ote,
      empresa
    );

    res.status(201).json({
      mensaje: "Proyecto creado con exito",
      proyectoId: nuevoProyecto.id,
    });
  } catch (error) {
    console.error("Error al crear ot obra:", error.message);
    res.status(500).send("Error del servidor al crear proyecto");
  }
};

const obtenerIdProyectos = async (req, res) => {
  const userId = req.user.id;
  const empresa = req.user.empresa;
  const { date } = req.query;

  try {
    const idProyectos = await getIdProyectos(userId, date, empresa);

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
    const empresa = req.user.empresa;
    const { id, estado } = req.body;

    // Cambiar estado del proyecto
    await cambiarEstadoProyecto(id, estado, empresa);

    res.status(201);
  } catch (error) {
    console.error("Error al crear proyecto:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerProyectosPorIds = async (req, res) => {
  const empresa = req.user.empresa;
  const { ids } = req.body;
  try {
    const proyectos = await getProyectos(ids, empresa);

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
    const empresa = req.user.empresa;
    const id_usuario = req.user.id;

    // Crear el proyecto y calendario
    const nuevoProyecto = await addProyecto(
      nombre,
      observaciones,
      id_usuario,
      id_cliente,
      fechaCalendario,
      es_ote,
      empresa
    );

    res.status(201).json({
      mensaje: "Orden Trabajo y calendario creados exitosamente",
      proyectoId: nuevoProyecto.id,
    });
  } catch (error) {
    console.error("Error al crear proyecto:", error.message);
    res.status(500).send("Error del servidor al crear proyecto");
  }
};

const obtenerContrato = async (req, res) => {
  try {
    const empresa = req.user.empresa;
    const { orden_trabajo_id } = req.body;

    const id_contrato = await getIdContrato(orden_trabajo_id, empresa);
    if (id_contrato) {
      const cabecera = await getContrato(id_contrato);

      const detalles = await getDetallesContrato(id_contrato);

      const contrato = { cabecera, detalles };
      res.status(200).json(contrato);
    } else {
      res.status(200).json(null);
    }
  } catch (error) {
    console.error("Error al obtener contrato:", error.message);
    res.status(500).json({ message: "Error en el servidor", data: null });
  }
};

const obtenerProyecto = async (req, res) => {
  try {
    const empresa = req.user.empresa;
    const { id } = req.body;

    // Obtener proyecto por Id
    const proyecto = await getProyectos(id, empresa);

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
  obtenerObras,
  crearOtObra,
};
