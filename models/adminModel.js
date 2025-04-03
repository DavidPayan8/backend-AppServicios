const sql = require("mssql");
const config = require("../config/dbConfig");

const darAltaEmpleado = async (id_admin, username, contrasenia, nombreApellidos, dni, segSocial) => {
	let codigoError;

	try {
		const pool = await sql.connect(config);
		const duplicados = await pool
			.request()
			.input("user_name", sql.VarChar, username)
			.query(`
				SELECT count(*) "count"
				FROM usuarios
				WHERE lower(user_name) = lower(@user_name);
				`);

		if (duplicados.recordset[0].count == 0) {
			const result = await pool
				.request()
				.input("id_admin", sql.Int, id_admin)
				.input("user_name", sql.VarChar, username)
				.input("contrasena", sql.VarChar, contrasenia)
				.input("nomapes", sql.VarChar, nombreApellidos)
				.input("dni", sql.VarChar, dni)
				.input("num_seguridad_social", sql.VarChar, segSocial)
				.query(`
					INSERT INTO usuarios (user_name, contrasena, nomapes, dni, num_seguridad_social, id_empresa)
					VALUES (@user_name, @contrasena, @nomapes, @dni, @num_seguridad_social, (SELECT id_empresa FROM usuarios WHERE id = @id_admin));
				`);

			if (result.rowsAffected != 1)
				codigoError = 500;
		} else {
			codigoError = 400;
		}
	} catch (error) {
		console.error("Error al dar de alta a un nuevo empleado: ", id_admin, username, contrasenia, nombreApellidos);
		throw error;
	}

	return codigoError;
}

/**
 * @typedef FiltrosGetEmpleados
 * @prop {string | undefined} nombreApellidos Filtro para nomapes, o ningún filtro
 * @prop {string | undefined} username Filtro para user_name, o ningún filtro
 * @prop {string | undefined} dni Filtro para dni, o ningún filtro
 * @prop {string | undefined} seguridadSocial Filtro para num_seguridad_social, o ningún filtro
 */

const ordenesValidos = ["id", "user_name", "nomapes", "dni", "num_seguridad_social"];

/**
 * Consulta los empleados de la empresa de un administrador.
 * @param {number} id_admin La ID del administrador
 * @param {number} pagina La página a obtener
 * @param {number} empleadosPorPagina Los empleados por página
 * @param {string | undefined} ordenarPor El campo con el cual se ordenarán los resultados
 * @param {boolean} esAscendiente Si los resultados se ordenan ascendientemente
 * @param {FiltrosGetEmpleados | undefined} filtros Los filtros de la consulta
 */
const getEmpleados = async (id_admin, pagina, empleadosPorPagina, ordenarPor, esAscendiente, filtros) => {
	try {
		// ordenesValidos es exportado para validar antes de llamar a getEmpleados
		if (!ordenesValidos.includes(ordenarPor)) {
			throw new Error("Orden inválido");
		}

		// Ademas de consultar los empleados, consultar el total de empleados
		// que cumplan con los filtros dados, esto se hace para habilitar
		// la paginación en el frontend
		const pool = await sql.connect(config);
		const result = await pool
			.request()
			.input("id_admin", sql.Int, id_admin)
			.input("user_name", sql.VarChar, filtros?.username)
			.input("nomapes", sql.VarChar, filtros?.nombreApellidos)
			.input("dni", sql.VarChar, filtros?.dni)
			.input("num_seguridad_social", sql.VarChar, filtros?.seguridadSocial)
			.input("order", sql.VarChar, ordenarPor)
			.input("filas", sql.Int, empleadosPorPagina)
			.input("offset", sql.Int, (pagina - 1) * empleadosPorPagina)
			.query(`
				SELECT id, user_name, nomapes, dni, num_seguridad_social
				FROM usuarios
				WHERE id_empresa = (SELECT id_empresa FROM usuarios WHERE id = @id_admin)
				${construirFiltros(filtros)}
				ORDER BY ${ordenarPor} ${esAscendiente ? " ASC" : " DESC"}
				OFFSET @offset ROWS FETCH NEXT @filas ROWS ONLY;
				SELECT COUNT(*) "total"
				FROM usuarios
				WHERE id_empresa = (SELECT id_empresa FROM usuarios WHERE id = @id_admin)
				${construirFiltros(filtros)};
			`);

		return {
			total: result.recordsets[1][0].total,
			empleados: result.recordsets[0],
		};
	} catch (error) {
		console.error("Error al obtener empleados: ", id_admin, pagina, empleadosPorPagina, ordenarPor, esAscendiente, filtros);
		throw error;
	}
}

/**
 * 
 * @param {FiltrosGetEmpleados | undefined} filtros 
 */
const construirFiltros = (filtros) => {
	const query = [""];

	// Construir filtros
	if (filtros?.username) {
		query.push("LOWER(user_name) COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE LOWER('%' + @user_name + '%')");
	}

	if (filtros?.nombreApellidos) {
		query.push("LOWER(nomapes) COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE LOWER('%' + @nomapes + '%')");
	}

	if (filtros?.dni) {
		query.push("LOWER(dni) LIKE LOWER('%' + @dni + '%')");
	}

	if (filtros?.seguridadSocial) {
		query.push("LOWER(num_seguridad_social) LIKE LOWER('%' + @num_seguridad_social + '%')");
	}

	return query.join(" AND ");
}

module.exports = {
	darAltaEmpleado,
	getEmpleados,
	ordenesValidos,
}