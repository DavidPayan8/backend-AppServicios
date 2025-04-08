const { darAltaEmpleado, getEmpleados, ordenesValidos, getDetalles, editarEmpleado } = require("../models/adminModel");

const darAltaEmpleadoHandler = async (req, res) => {
	try {
		const { username, password, nombreApellidos, dni, segSocial, rol } = req.body;
		const codigoError = await darAltaEmpleado(req.user.id, username, password, nombreApellidos, dni, segSocial, rol);

		switch (codigoError) {
			case 400: {
				res.status(400).json({ message: "Usuario duplicado" });
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
		console.error("Error al dar de alta empleado: ", error);
		res.status(500).send("Error del servidor");
	}
}

const getEmpleadosHandler = async (req, res) => {
	try {
		let { pagina, empleadosPorPagina, ordenarPor, esAscendiente, filtros } = req.body;

		// Controles
		if (!Number.isInteger(pagina) || pagina < 1) {
			res.statusMessage = "Campo 'página' es obligatorio y debe ser un número natural"
			res.status(400).send();
			return;
		}

		if (!Number.isInteger(empleadosPorPagina) || empleadosPorPagina < 1) {
			res.statusMessage = "Campo 'empleadosPorPagina' es obligatorio y debe ser un número natural"
			res.status(400).send();
			return;
		}

		if (esAscendiente === undefined) {
			esAscendiente = true;
		}

		if (ordenarPor === undefined) {
			ordenarPor = "id";
		} else if (!ordenesValidos.includes(ordenarPor)) {
			res.statusMessage = "Campo 'ordenarPor' es inválido";
			res.status(400).send();
			return;
		}

		const empleados = await getEmpleados(req.user.id, pagina, empleadosPorPagina, ordenarPor, esAscendiente, filtros);
		res.json(empleados);
	} catch (error) {
		console.error("Error al obtener empleados: ", error);
		res.status(500).send("Error del servidor");
	}
}

const getDetallesHandler = async (req, res) => {
	try {
		const { id } = req.body;
		res.json(await getDetalles(id));
	} catch (error) {
		console.error("Error al obtener detalles del empleado: ", error);
		res.status(500).send("Error del servidor");
	}
}

const editarEmpleadoHandler = async (req, res) => {
	try {
		console.log(req.body);
		const { id, username, password, nombreApellidos, dni, seguridadSocial, rol } = req.body;

		if (!username && !password && !nombreApellidos && !dni && !seguridadSocial && !rol) {
			res.status(400).send({ message: "No se está editando ningúna columna" });
			return;
		}

		const codigoError = await editarEmpleado(id, username, password, nombreApellidos, dni, seguridadSocial, rol);
		switch (codigoError) {
			case 400: {
				res.status(400).send({ message: "Nombre de usuario en uso" });
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
}

module.exports = {
	darAltaEmpleado: darAltaEmpleadoHandler,
	getEmpleados: getEmpleadosHandler,
	getDetalles: getDetallesHandler,
	editarEmpleado: editarEmpleadoHandler,
}