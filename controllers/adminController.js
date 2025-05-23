const identidad = require("../shared/identidad");
const { getVacaciones } = require("../Model/others/admiModel");
const db = require("../Model");
const { Op, fn } = require("sequelize");

const darAltaEmpleadoHandler = async (req, res) => {
  try {
    const {
      username,
      password,
      nombreApellidos,
      dni,
      segSocial,
      email,
      telefono,
      sexo,
      rol,
    } = req.body;

    if (!identidad.esDniValido(dni) && !identidad.esNieValido(dni)) {
      return res.status(400).json({ message: "DNI no válido" });
    }

    const existe = await db.USUARIOS.findOne({
      where: {
        [Op.or]: [{ user_name: username }, { dni }],
      },
    });

    if (existe) {
      return res
        .status(400)
        .json({ message: "Nombre de usuario y/o DNI en uso" });
    }

    await db.USUARIOS.create({
      user_name: username,
      contrasena: password,
      nomapes: nombreApellidos,
      dni,
      num_seguridad_social: segSocial,
      email,
      telefono,
      sexo,
      rol,
    });

    res.status(201).json({ message: "Alta completada" });
  } catch (error) {
    console.error("Error al dar de alta empleado: ", error);
    res.status(500).send("Error del servidor");
  }
};

const getEmpleadosHandler = async (req, res) => {
  let {
    pagina = 1,
    empleadosPorPagina = 10,
    ordenarPor = "id",
    esAscendiente = true,
    filtros = {},
  } = req.query;
  try {
    pagina = parseInt(pagina);
    empleadosPorPagina = parseInt(empleadosPorPagina);
    esAscendiente = esAscendiente === "true" || esAscendiente === true;
    const columnasValidas = [
      "id",
      "id_origen",
      "user_name",
      "contrasena",
      "nomapes",
      "id_config",
      "id_empresa",
      "DNI",
      "num_seguridad_social",
      "rol",
      "primer_inicio",
      "email",
      "telefono",
      "sexo",
    ];

    // Asegúrate de que ordenarPor sea una columna válida
    if (!columnasValidas.includes(ordenarPor)) {
      ordenarPor = "id"; // valor por defecto
    }

    if (typeof filtros === "string") {
      try {
        filtros = JSON.parse(filtros);
      } catch {
        filtros = {};
      }
    }

    const where = {};

    if (filtros.nombreApellidos) {
      where.nomapes = { [Op.like]: `%${filtros.nombreApellidos}%` };
    }

    if (filtros.username) {
      where.user_name = { [Op.like]: `%${filtros.username}%` };
    }

    if (filtros.dni) {
      where.dni = { [Op.like]: `%${filtros.dni}%` };
    }

    if (filtros.seguridadSocial) {
      where.num_seguridad_social = {
        [Op.like]: `%${filtros.seguridadSocial}%`,
      };
    }

    if (filtros.rol) {
      where.rol = {
        [Op.like]: `%${filtros.rol}%`,
        [Op.not]: "superadmin",
      };
    } else {
      where.rol = { [Op.not]: "superadmin" };
    }

    const { count: total, rows } = await db.USUARIOS.findAndCountAll({
      where: {
        ...where,
        id_empresa: req.user.empresa,
      },
      offset: (pagina - 1) * empleadosPorPagina,
      limit: empleadosPorPagina,
      order: [[ordenarPor, esAscendiente ? "ASC" : "DESC"]],
    });

    const empleados = rows.map((usuario) => ({
      id: usuario.id,
      username: usuario.user_name,
      password: usuario.contrasena,
      nombreApellidos: usuario.nomapes,
      dni: usuario.DNI,
      seguridadSocial: usuario.num_seguridad_social,
      email: usuario.email ?? null,
      telefono: usuario.telefono ?? null,
      rol: usuario.rol,
      sexo: usuario.sexo ?? null,
    }));

    res.status(200).json({ total, empleados });
  } catch (error) {
    console.error("Error al obtener empleados: ", error);
    res.status(500).send("Error del servidor");
  }
};

const getDetallesHandler = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).send("El parámetro 'id' es obligatorio");
    }

    const empleado = await db.USUARIOS.findByPk(id);
    if (!empleado) return res.status(404).send("Empleado no encontrado");

    res.status(200).json(empleado);
  } catch (error) {
    console.error("Error al obtener detalles del empleado: ", error);
    res.status(500).send("Error del servidor");
  }
};

const editarEmpleadoHandler = async (req, res) => {
  try {
    const {
      id,
      username,
      password,
      nombreApellidos,
      dni,
      seguridadSocial,
      email,
      telefono,
      rol,
      sexo,
    } = req.body;

    const camposActualizables = {
      user_name: username,
      contrasena: password,
      nomapes: nombreApellidos,
      dni,
      num_seguridad_social: seguridadSocial,
      email,
      telefono,
      rol,
      sexo,
    };
    const campos = Object.fromEntries(
      Object.entries(camposActualizables).filter(
        ([, fields]) => fields !== undefined
      )
    );

    if (Object.keys(campos).length === 0) {
      return res
        .status(400)
        .json({ message: "No se está editando ningúna columna" });
    }

    if (dni && !identidad.esDniValido(dni) && !identidad.esNieValido(dni)) {
      return res.status(400).json({ message: "DNI inválido" });
    }

    const empleadoExistente = await db.USUARIOS.findOne({
      where: {
        id: { [Op.ne]: id },
        [Op.or]: [{ user_name: username }, { dni }],
      },
    });

    if (empleadoExistente) {
      return res
        .status(400)
        .json({ message: "Nombre de usuario y/o DNI en uso" });
    }

    await db.USUARIOS.update(campos, { where: { id } });
    res.status(201).json({ message: "Actualizado con exito" });
  } catch (error) {
    console.error("Error al editar empleado: ", error);
    res.status(500).send("Error del servidor");
  }
};

const getVacacionesHandler = async (req, res) => {
  try {
    let {
      pagina = 1,
      itemsPorPagina = 10,
      filtros = {},
      ordenarPor = "id",
      esAscendiente = true,
    } = req.body;

    if (
      !Number.isInteger(pagina) ||
      pagina < 1 ||
      !Number.isInteger(itemsPorPagina) ||
      itemsPorPagina < 1
    ) {
      return res.status(400).send("Parámetros inválidos");
    }

    const vacaciones = await getVacaciones(
      req.user.id,
      pagina,
      itemsPorPagina,
      ordenarPor,
      esAscendiente,
      filtros
    );

    res.status(200).json(vacaciones);
  } catch (error) {
    console.error("Error al obtener vacaciones: ", error);
    res.status(500).send("Error del servidor");
  }
};

const getVacacionHandler = async (req, res) => {
  const idVacacion = req.body.id;
  try {
    const vacacion = await db.VACACIONES.findOne({
      where: { id: idVacacion },
      include: [
        {
          model: db.USUARIOS,
          as: "usuario",
          attributes: ["nomapes"],
        },
        {
          model: db.TIPOS_VACACION,
          as: "tipo_vacaciones",
          attributes: ["nombre"],
        },
        {
          model: db.VACACIONES_ESTADOS,
          as: "vacaciones_estado",
          attributes: ["estado", "tiempo"],
          order: [["tiempo", "DESC"]],
          limit: 1,
        },
        {
          model: db.DIAS_VACACION,
          as: "dias_vacacion",
          attributes: ["dia"],
        },
      ],
    });

    if (!vacacion) {
      res.status(400).json({ message: "Id no encontrado" });
    }

    const empleado = vacacion.usuario?.nomapes;
    const tipo = vacacion.tipo_vacaciones.nombre;

    const estado =
      vacacion.vacaciones_estado?.length > 0
        ? vacacion.vacaciones_estado[0].estado
        : "pendiente";

    console.log(vacacion.dias_vacacion);

    const dias = vacacion.dias_vacacion?.map((d) => d.dia) || [];

    res.status(200).json({
      empleado,
      tipo,
      estado,
      dias,
    });
  } catch (error) {
    console.error("Error al obtener detalles de vacación: ", idVacacion, error);
    res.status(500).json(error);
  }
};

const actualizarVacacionHandler = async (req, res) => {
  try {
    const { id, estado, razon } = req.body;

    await db.VACACIONES.update(
      { estado, razon, actualizadoPor: req.user.id },
      { where: { id } }
    );

    await db.VACACIONES_ESTADOS.create({
      id_vacacion: id,
      estado,
      razon,
      tiempo: fn("GETDATE"),
      cambiadoPor: req.user.id,
    });

    res.status(201).json({ message: "Actualizado con exito" });
  } catch (error) {
    console.error("Error al actualizar el estado de una vacación", error);
    res.status(500).send("Error del servidor");
  }
};

const getCambiosEstadoHandler = async (req, res) => {
  try {
    const { id } = req.body;
    const cambios = await db.VACACIONES_ESTADOS.findAll({
      where: { id_vacacion: id },
      include: [
        {
          model: db.USUARIOS,
          as: "admin",
          attributes: ["nomapes"],
        },
      ],
      attributes: [
        [
          db.Sequelize.fn(
            "CONVERT",
            db.Sequelize.literal("VARCHAR"),
            db.Sequelize.col("tiempo")
          ),
          "tiempo",
        ],
        "estado",
        "razon",
      ],
      order: [["tiempo", "DESC"]],
    });
    res.status(200).json(cambios);
  } catch (error) {
    console.error("Error al obtener los cambios de una vacación", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports = {
  darAltaEmpleado: darAltaEmpleadoHandler,
  getEmpleados: getEmpleadosHandler,
  getDetalles: getDetallesHandler,
  editarEmpleado: editarEmpleadoHandler,
  getVacaciones: getVacacionesHandler,
  getVacacion: getVacacionHandler,
  actualizarVacacion: actualizarVacacionHandler,
  getCambiosEstado: getCambiosEstadoHandler,
};
