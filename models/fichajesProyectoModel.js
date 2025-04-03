const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerFichajesProyecto = async (desde, hasta, trabajador, rol) => {
	try {
		const pool = await sql.connect(config);
		let query = `
      SELECT 
		  ca.Id,
          ca.Fecha,
          CONVERT(VARCHAR(5), ca.hora_entrada, 108) AS Entrada,
          CONVERT(VARCHAR(5), ca.hora_salida, 108) AS Salida,
          ROUND(DATEDIFF(MINUTE, ca.hora_entrada, ca.hora_salida), 2) AS Total,
          u.USER_NAME AS Trabajador,
          NULL AS Rol,
          ca.localizacion_entrada AS Ubicacion_entrada,
          ca.localizacion_salida AS Ubicacion_salida
      FROM CONTROL_ASISTENCIAS ca
      INNER JOIN USUARIOS u ON ca.id_usuario = u.id
    `;

		let conditions = [];
		let request = pool.request();

		if (desde) {
			conditions.push("ca.Fecha >= @desde");
			request.input("desde", sql.Date, desde);
		}
		if (hasta) {
			conditions.push("ca.Fecha <= @hasta");
			request.input("hasta", sql.Date, hasta);
		}
		if (trabajador) {
			conditions.push("u.USER_NAME LIKE '%' + @trabajador + '%'");
			request.input("trabajador", sql.VarChar, trabajador);
		}
		// El rol todavia no está implementado en la base de datos
		/* if (rol) {
			conditions.push("u.rol = @rol");
			request.input("rol", sql.VarChar, rol);
		} */

		if (conditions.length > 0) {
			query += " WHERE " + conditions.join(" AND ");
		}

		const result = await request.query(query);
		return result.recordset;
	} catch (error) {
		console.error("Error al obtener fichajes por proyecto:", error.message);
		throw error;
	}
};

module.exports = {
	obtenerFichajesProyecto,
};
