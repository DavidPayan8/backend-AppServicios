const { darAltaEmpleado } = require("../models/adminModel");

const darAltaEmpleadoHandler = async (req, res) => {
	try {
		const { username, contrasenia, nombreApellidos } = req.body;
		const codigoError = await darAltaEmpleado(username, contrasenia, nombreApellidos, req.user.id_empresa);

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

module.exports = {
	darAltaEmpleado: darAltaEmpleadoHandler
}