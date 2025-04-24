const {
  darAltaEmpleado,
  getEmpleados,
  getVacaciones,
  getDetalles,
  editarEmpleado,
} = require("../models/adminModel");
const identidad = require("../shared/identidad");

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
    const mensajeError = await darAltaEmpleado(
      req.user.id,
      username,
      password,
      nombreApellidos,
      dni,
      segSocial,
      email,
      telefono,
      rol
    );

    if (!mensajeError) {
      res.status(201).send();
    } else {
      res.status(400).json({ message: mensajeError });
    }
  } catch (error) {
    console.error("Error al dar de alta empleado: ", error);
    res.status(500).send("Error del servidor");
  }
};

const getEmpleadosHandler = async (req, res) => {
  try {
    let { pagina, empleadosPorPagina, ordenarPor, esAscendiente, filtros } =
      req.query;

    pagina = parseInt(pagina, 10);
    empleadosPorPagina = parseInt(empleadosPorPagina, 10);
    esAscendiente = esAscendiente === "true";

    if (typeof filtros === "string") {
      try {
        filtros = JSON.parse(filtros);
      } catch (e) {
        filtros = {};
      }
    }
    if (ordenarPor === undefined) {
      ordenarPor = "id";
    } else if (!ordenesEmpleadoValidos.includes(ordenarPor)) {
      res.statusMessage = "Campo 'ordenarPor' es inválido";
      res.status(400).send();
      return;
    }

    const empleados = await getEmpleados(
      req.user.id,
      pagina,
      empleadosPorPagina,
      ordenarPor,
      esAscendiente,
      filtros
    );
    res.json(empleados);
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

    res.json(await getDetalles(id));
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

    if (
      !username &&
      !password &&
      !nombreApellidos &&
      !dni &&
      !seguridadSocial &&
      !rol &&
      !email &&
      !telefono &&
      !sexo
    ) {
      res.status(400).send({ message: "No se está editando ningúna columna" });
      return;
    }

    if (dni && !identidad.esDniValido(dni) && !identidad.esNieValido(dni)) {
      res.status(400).send({ message: "DNI inválido" });
      return;
    }

    const codigoError = await editarEmpleado(
      id,
      username,
      password,
      nombreApellidos,
      dni,
      seguridadSocial,
      email,
      telefono,
      rol,
      sexo
    );
    switch (codigoError) {
      case 400: {
        res.status(400).send({ message: "Nombre de usuario y/o DNI en uso" });
        break;
      }
      case undefined: {
        // Exito
        res.status(201).send();
        break;
      }
      default: {
        res.status(500).send("Error del servidor");
      }
    }
  } catch (error) {
    console.error("Error al editar empleado: ", error);
    res.status(500).send("Error del servidor");
  }
};

const getVacacionesHandler = async (req, res) => {
  try {
    let { pagina, itemsPorPagina, filtros, ordenarPor, esAscendiente } =
      req.body;

    // Controles
    if (!Number.isInteger(pagina) || pagina < 1) {
      res.statusMessage =
        "Campo 'página' es obligatorio y debe ser un número natural";
      res.status(400).send();
      return;
    }

    if (!Number.isInteger(itemsPorPagina) || itemsPorPagina < 1) {
      res.statusMessage =
        "Campo 'itemsPorPagina' es obligatorio y debe ser un número natural";
      res.status(400).send();
      return;
    }

    if (esAscendiente === undefined) {
      esAscendiente = true;
    }

    if (ordenarPor === undefined) {
      ordenarPor = "id";
    } else if (!ordenesVacacionValidos.includes(ordenarPor)) {
      res.statusMessage = "Campo 'ordenarPor' es inválido";
      res.status(400).send();
      return;
    }

    const vacaciones = await getVacaciones(
      req.user.id,
      pagina,
      itemsPorPagina,
      ordenarPor,
      esAscendiente,
      filtros
    );
    res.json(vacaciones);
  } catch (error) {
    console.error("Error al obtener vacaciones: ", error);
    res.status(500).send("Error del servidor");
  }
};

const getVacacionHandler = async (req, res) => {
  try {
    const { id } = req.body;

    if (id === undefined || !Number.isInteger(id)) {
      res.statusMessage = "ID indefinido o inválido";
      res.status(400).send();
      return;
    }

    const detalles = await getVacacion(id);
    res.json(detalles);
  } catch (error) {
    console.error("Error al obtener los detalles de una vacación: ", error);
    res.status(500).send("Error del servidor");
  }
};

const actualizarVacacionHandler = async (req, res) => {
  try {
    const { id, estado, razon } = req.body;
    await actualizarVacacion(id, req.user.id, estado, razon);
    res.status(201).send();
  } catch (error) {
    console.error("Error al actualizar el estado de una vacación", error);
    res.status(500).send("Error del servidor");
  }
};

const getCambiosEstadoHandler = async (req, res) => {
  try {
    const { id } = req.body;
    const cambios = await getCambiosEstado(id);
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
