const sql = require("mssql");
const config = require("../config/dbConfig");
const { LocalDate, DateTimeFormatter, ZoneId, DayOfWeek } = require("@js-joda/core");
const { Locale } = require("@js-joda/locale_es");
require("@js-joda/timezone");


const obtenerTotalVacaciones = async (id_usuario) => {
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
		.input("id_usuario", sql.Int, id_usuario)
		.query(`
			SELECT SUM(COALESCE(cantidad_dias, 0)) "dias"
			FROM tipos_vacacion
			WHERE id_empresa IS NULL OR id_empresa = (SELECT id_empresa FROM usuarios WHERE id = @id_usuario);`);


	vacaciones.pendientes = resultTipos.recordset[0].dias - total;

	return vacaciones;
}

const obtenerTiposVacacion = async (id_usuario) => {
	try {
		const pool = await sql.connect(config);
		const result = await pool
			.request()
			.input("id_usuario", sql.Int, id_usuario)
			.query(`
				SELECT id, nombre, cantidad_dias "dias", es_dias_naturales
				FROM tipos_vacacion
				WHERE id_empresa IS NULL OR id_empresa = (SELECT id_empresa FROM usuarios WHERE id = @id_usuario);`);
		return result.recordset;
	} catch (error) {
		console.error("Error al obtener tipos de vacacion.");
		throw error;
	}
}

/**
 * 
 * @param {number} id_usuario ID del usuario
 * @param {number} tipo ID del tipo de vacación
 * @param {boolean} aceptadas Si se buscan las vacaciones aceptadas (de caso contrario, las solicitadas)
 * @returns 
 */
const obtenerVacaciones = async (id_usuario, tipo, aceptadas) => {
	try {
		const pool = await sql.connect(config);
		const result = await pool
			.request()
			.input("id_usuario", sql.Int, id_usuario)
			.input("aceptadas", sql.Bit, aceptadas ? 1 : 0)
			.input("tipo", sql.Int, tipo)
			.query(`
				SELECT vacaciones.id, CONVERT(VARCHAR(10), dia, 120) "dia"
				FROM vacaciones, dias_vacacion
				WHERE vacaciones.id = dias_vacacion.id_vacacion
				AND tipo = @tipo AND id_usuario = @id_usuario AND aceptado = @aceptadas;`);
		// Selecciono dia como una cadena para evitar que mssql
		// convierta al dia a un Date de JavaScript		

		return result.recordset;
	} catch (error) {
		console.error("Error al obtener vacaciones.");
		throw error;
	}
}


/**
 * @async
 * @param {number} id_usuario ID del usuario solicitando vacaciones.
 * @param {number} tipo ID del tipo de vacaciones.
 * @param {string[]} dias Dias que el usuario está solicitando.
 * @returns {string | null} Mensaje de error, si ocurre uno.
 */
const solicitarVacaciones = async (id_usuario, tipo, dias) => {
	try {
		const pool = await sql.connect(config);
		const formatter = DateTimeFormatter.ofPattern("YYYY-MM-dd").withLocale(new Locale("es", "ES", "es"));

		for (const diaStr of dias) {
			const dia = LocalDate.parse(diaStr);

			// Validar día
			if (!esDiaValido(dia)) {
				return "Fecha inválida";
			}

			// Verificar que el usuario no tenga un día de vacación para ese día
			const result = await pool
				.request()
				.input("id_usuario", sql.Int, id_usuario)
				.input("fecha", sql.Date, dia.format(formatter))
				.query(`
					SELECT COUNT(dia) "count"
					FROM vacaciones, dias_vacacion
					WHERE id_usuario = @id_usuario
					AND vacaciones.id = id_vacacion
					AND dia = @fecha;`);

			if (result.recordset[0].count > 0) {
				return "Vacación existente para la fecha";
			}
		}

		const result = await pool
			.request()
			.input("id_usuario", sql.Int, id_usuario)
			.input("tipo", sql.Int, tipo)
			.query(`INSERT INTO vacaciones
					OUTPUT INSERTED.id
					VALUES (0, @tipo, @id_usuario)`);

		const id = result.recordset[0].id;

		// Insertar todos los días
		const table = new sql.Table("dias_vacacion");
		table.create = false;
		table.columns.add("id_vacacion", sql.Int, { nullable: false });
		table.columns.add("dia", sql.Date, { nullable: false });

		for (const diaStr of dias) {
			const dia = LocalDate.parse(diaStr);
			table.rows.add(id, dia.format(formatter));
		}

		await pool.request().bulk(table);
	} catch (error) {
		console.error("Error al solicitar vacaciones.");
		throw error;
	}

	return null;
}

/**
 * Verifica que el día sea después del día actual y que sea un día de semana.
 * @param {LocalDate} dia El día
 * @returns {boolean}
 */
const esDiaValido = (dia) => {
	const dayOfWeek = dia.dayOfWeek();
	const hoy = LocalDate.now(ZoneId.of("Europe/Madrid"));
	return dia.isAfter(hoy) && dayOfWeek !== DayOfWeek.SATURDAY && dayOfWeek !== DayOfWeek.SUNDAY;
}

module.exports = {
	obtenerTotalVacaciones,
	obtenerTiposVacacion,
	obtenerVacaciones,
	solicitarVacaciones,
};