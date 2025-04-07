const { obtenerTotalVacaciones, obtenerTiposVacacion, obtenerVacaciones, solicitarVacaciones } = require('../models/vacacionesModel');

const obtenerTotalVacacionesHandler = async (req, res) => {
	try {
		let total = await obtenerTotalVacaciones(req.user.id, req.user.id_empresa);
		res.status(200).json(total);
	} catch (error) {
		console.error('Error al obtener total de vacaciones:', error.message);
		res.status(500).send('Error del servidor');
	}
};

const obtenerTiposVacacionHandler = async (req, res) => {
	try {
		let tipos = await obtenerTiposVacacion(req.user.id_empresa);
		res.status(200).json(tipos);
	} catch (error) {
		console.error('Error al obtener tipos de vacacion: ', error.message);
		res.status(500).send('Error del servidor');
	}
}

const obtenerVacacionesAceptadas = async (req, res) => {
	try {
		const { tipo } = req.body;
		let vacaciones = await obtenerVacaciones(req.user.id, tipo, true);
		res.status(200).json(vacaciones);
	} catch (error) {
		console.error('Error al obtener vacaciones aceptadas: ', error.message);
		res.status(500).send('Error del servidor');
	}
}

const obtenerVacacionesSolicitadas = async (req, res) => {
	try {
		const { tipo } = req.body;
		let vacaciones = await obtenerVacaciones(req.user.id, tipo, false);
		res.status(200).json(vacaciones);
	} catch (error) {
		console.error('Error al obtener vacaciones aceptadas: ', error.message);
		res.status(500).send('Error del servidor');
	}
}

const solicitarVacacionesHandler = async (req, res) => {
	try {
		const { tipo, dias } = req.body;
		const err = await solicitarVacaciones(req.user.id, tipo, dias);

		if (!err) {
			res.status(201).json({})
		} else {
			res.json({ err })
		}
	} catch (error) {
		console.error('Error solicitar vacaciones: ', error.message);
		res.status(500).send('Error del servidor');
	}
}

module.exports = {
	obtenerTotalVacaciones: obtenerTotalVacacionesHandler,
	obtenerTiposVacacion: obtenerTiposVacacionHandler,
	obtenerVacacionesAceptadas,
	obtenerVacacionesSolicitadas,
	solicitarVacaciones: solicitarVacacionesHandler,
}