const sql = require("mssql");
const config = require("../config/dbConfig");


const obtenerDatosTransportador = async (idEmpleado) => {
	try {
		const pool = await sql.connect(config);
		const result = await pool
			.request()
			.input("id_empleado", sql.Int, idEmpleado)
			.query(`
				SELECT *
				FROM config_empresa
				WHERE id_empresa = (
					SELECT id_empresa
					FROM usuarios
					WHERE id = @id_empleado
				);
			`);

		return result.recordset[0];
	} catch (error) {
		console.error("Error al obtener datos de transportador.", idEmpleado);
		throw error;
	}
}

module.exports = {
	obtenerDatosTransportador,
}