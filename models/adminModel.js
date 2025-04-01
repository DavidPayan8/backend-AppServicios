const sql = require("mssql");
const config = require("../config/dbConfig");

const darAltaEmpleado = async (username, contrasenia, nombreApellidos, id_empresa) => {
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
				.input("user_name", sql.VarChar, username)
				.input("contrasena", sql.VarChar, contrasenia)
				.input("nomapes", sql.VarChar, nombreApellidos)
				.input("id_empresa", sql.Int, id_empresa)
				.query(`
				INSERT INTO usuarios (user_name, contrasena, nomapes, id_empresa)
				VALUES (@user_name, @contrasena, @nomapes, @id_empresa);
				`);

			if (result.rowsAffected != 1)
				codigoError = 500;
		} else {
			codigoError = 400;
		}
	} catch (error) {
		console.error("Error al dar de alta a un nuevo empleado: ", details);
		throw error;
	}

	return codigoError;
}

module.exports = {
	darAltaEmpleado
}