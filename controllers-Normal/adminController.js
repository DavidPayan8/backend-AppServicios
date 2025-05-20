const { Empleado, Vacacion, CambioEstado } = require("../Model");
const identidad = require("../shared/identidad");
const db = require("../Model");
const { Op } = require("sequelize");

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
      rol,
    } = req.body;

    const existe = await db.USUARIOS.findOne({
      where: {
        [Op.or]: [{ username }, { dni }],
      },
    });

    if (existe) {
      return res
        .status(400)
        .json({ message: "Nombre de usuario y/o DNI en uso" });
    }

    await db.USUARIOS.create({
      username,
      password,
      nombreApellidos,
      dni,
      segSocial,
      email,
      telefono,
      rol
    });

    res.status(201).send();
  } catch (error) {
    console.error("Error al dar de alta empleado: ", error);
    res.status(500).send("Error del servidor");
  }
};

const getEmpleadosHandler = async (req, res) => {
  try {
    let {
      pagina = 1,
      empleadosPorPagina = 10,
      ordenarPor = "id",
      esAscendiente = true,
      filtros = {},
    } = req.query;

    pagina = parseInt(pagina);
    empleadosPorPagina = parseInt(empleadosPorPagina);
    esAscendiente = esAscendiente === "true" || esAscendiente === true;

    if (typeof filtros === "string") {
      try {
        filtros = JSON.parse(filtros);
      } catch {
        filtros = {};
      }
    }

    const where = {};
    if (filtros.nombre) {
      where.nombreApellidos = { [Op.like]: `%${filtros.nombre}%` };
    }

    const empleados = await db.USUARIOS.findAndCountAll({
      where: {
        ...where,
        id_empresa: req.user.empresa,
      },
      offset: (pagina - 1) * empleadosPorPagina,
      limit: empleadosPorPagina,
      order: [[ordenarPor, esAscendiente ? "ASC" : "DESC"]],
    });

    res.status(200).json(empleados);
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

    res.json(empleado);
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
      username,
      password,
      nombreApellidos,
      dni,
      segSocial: seguridadSocial,
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
        [Op.or]: [{ username }, { dni }],
      },
    });

    if (empleadoExistente) {
      return res
        .status(400)
        .json({ message: "Nombre de usuario y/o DNI en uso" });
    }

    await db.USUARIOS.update(campos, { where: { id } });
    res.status(201).send();
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

    const where = {};
    if (filtros.estado) where.estado = filtros.estado;

    const vacaciones = await db.VACAIONES.findAndCountAll({
      where,
      offset: (pagina - 1) * itemsPorPagina,
      limit: itemsPorPagina,
      order: [[ordenarPor, esAscendiente ? "ASC" : "DESC"]],
    });

    res.json(vacaciones);
  } catch (error) {
    console.error("Error al obtener vacaciones: ", error);
    res.status(500).send("Error del servidor");
  }
};

const getVacacionHandler = async (req, res) => {
  try {
    const { id } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).send("ID indefinido o inválido");
    }

    const vacacion = await db.VACAIONES.findByPk(id);
    if (!vacacion) return res.status(404).send("Vacación no encontrada");

    res.json(vacacion);
  } catch (error) {
    console.error("Error al obtener los detalles de una vacación: ", error);
    res.status(500).send("Error del servidor");
  }
};

const actualizarVacacionHandler = async (req, res) => {
  try {
    const { id, estado, razon } = req.body;

    await db.VACAIONES.update(
      { estado, razon, actualizadoPor: req.user.id },
      { where: { id } }
    );

    await db.VACAIONES_ESTADOS.create({
      vacacionId: id,
      estado,
      razon,
      cambiadoPor: req.user.id,
    });

    res.status(201).send();
  } catch (error) {
    console.error("Error al actualizar el estado de una vacación", error);
    res.status(500).send("Error del servidor");
  }
};

const getCambiosEstadoHandler = async (req, res) => {
  try {
    const { id } = req.body;
    const cambios = await db.VACAIONES_ESTADOS.findAll({
      where: { vacacionId: id },
      order: [["createdAt", "DESC"]],
    });
    res.json(cambios);
  } catch (error) {
    console.error("Error al obtener los cambios de una vacación", error);
    res.status(500).send("Error del servidor");
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
