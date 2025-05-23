const db = require("../Model");
const { Op, fn, col } = require("sequelize");

const getActividades = async (req, res) => {
  const id_usuario = req.user.id;
  const { empresa } = req.user;

  try {
    const actividades = await db.ORDEN_TRABAJO.findAll({
      where: {
        id_usuario,
        id_empresa: empresa,
      },
      include: [
        {
          model: db.PROYECTOS,
          as: "proyecto",
          required: true,
          attributes: [],
          where: {
            tipo: 2,
          },
          on: {
            [db.Sequelize.Op.and]: [
              db.Sequelize.where(
                db.Sequelize.col("ORDEN_TRABAJO.id_servicio_origen"),
                "=",
                db.Sequelize.col("proyecto.id_origen")
              ),
              db.Sequelize.where(
                db.Sequelize.col("ORDEN_TRABAJO.id_empresa"),
                "=",
                db.Sequelize.col("proyecto.id_empresa")
              ),
            ],
          },
        },
      ],
    order: [["orden", "DESC"]],
    });

    res.status(200).json(actividades);
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    res.status(500).json({ error: "Error al obtener actividades" });
  }
};

const getObras = async (req, res) => {
  const { empresa } = req.user;
  try {
    const obras = await db.PROYECTOS.findAll({
      where: { id_empresa: empresa },
      raw: true,
    });

    res.status(200).json(obras);
  } catch (error) {
    console.error("Error al obtener obras:", error);
    res.status(500).json({ error: "Error al obtener obras" });
  }
};

const createOtObra = async (req, res) => {
  const { nombre, id_cliente, id_obra, fechaCalendario, es_ote } = req.body;
  const id_usuario = req.user.id;
  const { empresa } = req.user;
  const transaction = await db.sequelize.transaction();
  try {
    // Crear Orden de Trabajo
    const nuevaOT = await db.ORDEN_TRABAJO.create(
      {
        id_usuario,
        nombre,
        id_cliente,
        id_servicio_origen: id_obra,
        es_ote,
        id_empresa: empresa,
      },
      { transaction }
    );

    // Crear calendario
    await db.CALENDARIO.create(
      {
        fecha: fechaCalendario,
        id_usuario,
        id_proyecto: nuevaOT.id,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({
      mensaje: "Proyecto creado con exito",
      proyectoId: nuevaOT.id,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error al crear ot obra:", error.message);
    res.status(500).send("Error del servidor al crear proyecto");
  }
};

const getIdProyectos = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;
  try {
    const calendario = await db.CALENDARIO.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [{ id_usuario: userId }, { id_usuario: 0 }],
          },
          { fecha: date },
        ],
      },
      include: [
        {
          model: db.ORDEN_TRABAJO,
          as: "orden_trabajo",
          required: true,
          include: [
            {
              model: db.PROYECTOS,
              as: "proyecto",
              where: {
                tipo: { [Op.ne]: 1 },
              },
              required: false,
              attributes: [],
            },
          ],
          attributes: ["id"],
        },
      ],
      attributes: ["id_proyecto"],
    });

    res.status(200).json(calendario);
  } catch (error) {
    console.error("Error al obtener calendario:", error.message);
    res.status(500).json({ message: "Error al obtener calendario" });
  }
};

const cambiarEstado = async (req, res) => {
  const { id, estado } = req.body;

  try {
    const updateFields = { estado };

    if (estado === "en curso") {
      updateFields.fecha_inicio = db.Sequelize.literal("GETDATE()");
    }

    if (estado === "finalizado") {
      updateFields.fecha_fin = db.Sequelize.literal("GETDATE()");
    }

    await db.ORDEN_TRABAJO.update(updateFields, { where: { id } });

    res.status(201).json({ message: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("Error al cambiar estado del proyecto:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};

const obtenerProyectosPorIds = async (req, res) => {
  const { ids } = req.query;

  const idsArray = typeof ids === "string" ? ids.split(",").map(Number) : ids;

  try {
    const proyectos = await db.ORDEN_TRABAJO.findAll({
      where: {
        id: {
          [Op.in]: idsArray,
        },
      },
      include: [
        {
          model: db.PARTES_TRABAJO,
          as: "partes_trabajo",
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "nombre",
        "id_usuario",
        "estado",
        [fn("MIN", col("partes_trabajo.hora_entrada")), "hora_inicio"],
        [fn("MAX", col("partes_trabajo.hora_salida")), "hora_fin"],
      ],
      group: [
        "ORDEN_TRABAJO.id",
        "ORDEN_TRABAJO.nombre",
        "ORDEN_TRABAJO.id_usuario",
        "ORDEN_TRABAJO.estado",
      ],
    });

    res.status(200).json(proyectos);
  } catch (error) {
    console.error("Error al obtener los proyectos por IDs:", error.message);
    res.status(500).json({
      message: "Error del servidor al obtener los proyectos por IDs.",
    });
  }
};

const crearProyecto = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { nombre, observaciones, detalles, id_cliente, es_ote } = req.body;
    const id_usuario = req.user.id;
    const { empresa } = req.user;

    // Crear el nuevo proyecto (OrdenTrabajo)
    const nuevoProyecto = await db.ORDEN_TRABAJO.create(
      {
        nombre,
        observaciones,
        detalles,
        id_cliente: id_cliente === 0 ? null : id_cliente,
        es_ote,
        id_usuario,
        id_empresa: empresa,
      },
      { transaction }
    );

    // Crear entrada en Calendario
    const calendario = await db.CALENDARIO.create(
      {
        fecha: new Date(),
        id_usuario,
        id_proyecto: nuevoProyecto.id,
      },
      { transaction }
    );

    // Confirmar transacción
    await transaction.commit();

    res.status(201).json({
      mensaje: "Orden Trabajo y calendario creados exitosamente",
      proyectoId: nuevoProyecto.id,
      calendarioId: calendario.id,
    });
  } catch (error) {
    // Revertir transacción si algo falla
    if (transaction) await transaction.rollback();
    console.error("Error al crear proyecto:", error.message);
    res.status(500).send("Error del servidor al crear proyecto");
  }
};

const obtenerContrato = async (req, res) => {
  try {
    const { orden_trabajo_id } = req.query;

    // Buscar la orden de trabajo para obtener el id_contrato
    const orden = await db.ORDEN_TRABAJO.findByPk(orden_trabajo_id, {
      attributes: ["id_contrato"],
    });

    if (!orden || !orden.id_contrato) {
      return res.status(200).json(null);
    }

    // Obtener el contrato con sus detalles
    const contrato = await db.CONTRATO.findByPk(orden.id_contrato, {
      include: [
        {
          model: db.DETALLES_CONTRATO,
          as: "detalles",
        },
      ],
    });

    res.status(200).json(contrato);
  } catch (error) {
    console.error("Error al obtener contrato:", error.message);
    res.status(500).json({ message: "Error en el servidor", data: null });
  }
};

const obtenerProyecto = async (req, res) => {
  const { id } = req.query;

  try {
    const result = await db.ORDEN_TRABAJO.findOne({
      attributes: [
        "id",
        "id_origen",
        "nombre",
        "observaciones",
        "id_cliente",
        "es_ote",
        "detalles",
        "estado",
        "id_usuario",
        "id_servicio_origen",
        "articulo_id",
        "id_contrato",
        "direccion",
        "id_empresa",
        [fn("MIN", col("partes_trabajo.hora_entrada")), "hora_inicio"],
        [fn("MAX", col("partes_trabajo.hora_salida")), "hora_fin"],
      ],
      where: {
        id,
      },
      include: [
        {
          model: db.CLIENTES,
          as: "cliente_ot",
          attributes: ["nombre"],
        },
        {
          model: db.PARTES_TRABAJO,
          as: "partes_trabajo",
          attributes: [],
        },
      ],
      group: [
        "Orden_Trabajo.id",
        "Orden_Trabajo.id_origen",
        "Orden_Trabajo.nombre",
        "Orden_Trabajo.observaciones",
        "Orden_Trabajo.id_cliente",
        "Orden_Trabajo.es_ote",
        "Orden_Trabajo.detalles",
        "Orden_Trabajo.estado",
        "Orden_Trabajo.id_usuario",
        "Orden_Trabajo.id_servicio_origen",
        "Orden_Trabajo.articulo_id",
        "Orden_Trabajo.id_contrato",
        "Orden_Trabajo.direccion",
        "Orden_Trabajo.id_empresa",
        "cliente_ot.nombre",
        "cliente_ot.id",
      ],
    });

    const plainResult = result?.get({ plain: true }) || {};

    plainResult.nombre_cliente = plainResult.cliente_ot?.nombre || null;
    delete plainResult.cliente_ot;

    res.status(200).json(plainResult);
  } catch (error) {
    console.error("Error al obtener órdenes de trabajo:", error);
    res.status(500).json({ message: "Error al obtener órdenes de trabajo" });
  }
};

const autoAsignarOrdenTrabajo = async (req, res) => {
  try {
    const { id_ot } = req.body;
    const id_usuario = req.user.id;

    // Buscar el proyecto por ID
    const proyecto = await db.ORDEN_TRABAJO.findByPk(id_ot);

    if (!proyecto) {
      return res
        .status(404)
        .json({ message: "Orden de trabajo no encontrada" });
    } else if (proyecto.id_usuario) {
      return res.status(400).json({ message: "Orden de trabajo ya asignada" });
    }

    // Asignar OT y actualizar calendario
    const [updatedProyecto, updatedCalendario] = await Promise.all([
      db.ORDEN_TRABAJO.update({ id_usuario }, { where: { id: id_ot } }),
      db.CALENDARIO.update({ id_usuario }, { where: { id_proyecto: id_ot } }),
    ]);

    const success = updatedProyecto[0] > 0 || updatedCalendario[0] > 0;

    res.status(200).json({ success });
  } catch (error) {
    console.error("Error al autoasignar OT:", error.message);
    res.status(500).send("Error del servidor al autoasignar OT");
  }
};

module.exports = {
  obtenerIdProyectos: getIdProyectos,
  obtenerProyectosPorIds,
  crearProyecto,
  obtenerProyecto,
  cambiarEstado,
  obtenerContrato,
  obtenerObras: getObras,
  crearOtObra: createOtObra,
  autoAsignarOrdenTrabajo,
  obtenerActividades: getActividades,
};
