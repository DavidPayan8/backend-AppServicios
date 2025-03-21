const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerTotalVacaciones = async (id_usuario, id_empresa) => {
	const pool = await sql.connect(config);

	// Consulta la cantidad de días de vacación
	const resultVacaciones = await pool
		.request()
		.input("id_usuario", sql.Int, id_usuario)
		.query(`
			SELECT COUNT(dia) "dias", aceptado
			FROM vacaciones, dias_vacacion
			WHERE id_usuario = @id_usuario AND vacaciones.id = id_vacacion
			GROUP BY aceptado;`);

	let total = 0;
	const vacaciones = {
		aceptadas: 0,
		solicitadas: 0,
		pendientes: 0,
	};

	for (let i = 0; i < resultVacaciones.recordset.length; i++) {
		const record = resultVacaciones.recordset[i];

		if (record.aceptado) {
			vacaciones.aceptadas += record.dias;
		} else {
			vacaciones.solicitadas += record.dias;
		}

		total += record.dias;
	}

	// Consulta la cantidad de días disponibles en los tipos de vacación
	const resultTipos = await pool
		.request()
		.input("id_empresa", sql.Int, id_empresa)
		.query(`
			SELECT SUM(COALESCE(cantidad_dias, 0)) "dias"
			FROM tipos_vacacion
			WHERE id_empresa IS NULL OR id_empresa = NULL;`);
	
	vacaciones.pendientes = resultTipos.recordset[0].dias - total;

	return vacaciones;
}

const obtenerTiposVacacion = async (id_empresa) => {
	try {
		const pool = await sql.connect(config);
		const result = await pool
			.request()
			.input("id_empresa", sql.Int, id_empresa)
			.query(`
				SELECT id, nombre, cantidad_dias "dias", es_dias_naturales
				FROM tipos_vacacion
				WHERE id_empresa IS NULL OR id_empresa = @id_empresa;`);
		return result.recordset;
	} catch (error) {
		console.error("Error al obtener tipos de vacacion.");
		throw error;
	}
}

const obtenerVacaciones = async (id_usuario, tipo, aceptadas) => {
	try {
		const pool = await sql.connect(config);
		const result = await pool
			.request()
			.input("id_usuario", sql.Int, id_usuario)
			.input("aceptadas", sql.Bit, aceptadas ? 1 : 0)
			.input("tipo", sql.Int, tipo)
			.query(`
				SELECT vacaciones.id, dia
				FROM vacaciones, dias_vacacion
				WHERE vacaciones.id = dias_vacacion.id_vacacion
				AND tipo = @tipo AND id_usuario = @id_usuario AND aceptado = @aceptadas;`);

		return result.recordset;
	} catch (error) {
		console.error("Error al obtener vacaciones.");
		throw error;
	}
}

module.exports = {
	obtenerTotalVacaciones,
	obtenerTiposVacacion,
	obtenerVacaciones,
};