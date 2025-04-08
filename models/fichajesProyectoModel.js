const sql = require("mssql");
const config = require("../config/dbConfig");

const obtenerFichajesProyecto = async (desde, hasta, trabajador, rol) => {
	try {
		const pool = await sql.connect(config);
		let query = `
      SELECT 
		  ca.Id,
          ca.Fecha,
          ca.hora_entrada AS Entrada,
          ca.hora_salida AS Salida,
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
		// TODO: implementar rol
		/* if (rol) {
			conditions.push("u.rol = @rol");
			request.input("rol", sql.VarChar, rol);
		} */

		if (conditions.length > 0) {
			query += " WHERE " + conditions.join(" AND ");
		}
		query += " ORDER BY ca.Fecha DESC";
		const result = await request.query(query);
		return result.recordset;
	} catch (error) {
		console.error("Error al obtener fichajes por proyecto:", error.message);
		throw error;
	}
};

const eliminarFichajes = async (ids) => {
	if (!Array.isArray(ids)) {
		throw new Error("El parámetro debe ser un array de números");
	}
	if (!ids.every(id => typeof id === 'number')) {
		throw new Error("El array debe contener solo números");
	}
	try {
		const pool = await sql.connect(config);
		const request = pool.request();
		ids.forEach((id, index) => {
			request.input(`id${index}`, sql.Int, id);
		});
		const whereClause = `Id IN (${ids.map((_, index) => `@id${index}`).join(', ')})`;
		const result = await request.query(`DELETE FROM CONTROL_ASISTENCIAS WHERE ${whereClause}`);

		return result;
	} catch (error) {
		console.error("Error al eliminar fichaje:", error.message);
		throw error;
	}
}

const patchFichaje = async (id, fecha, horaEntrada, horaSalida, localizacionEntrada, localizacionSalida) => {
	let query = `UPDATE CONTROL_ASISTENCIAS SET `;
	if (!fecha && !horaEntrada && !horaSalida && !localizacionEntrada && !localizacionSalida) {
		throw new Error("No se han proporcionado campos para actualizar.");
	}
	if (!id) {
		throw new Error("El ID del fichaje es obligatorio.");
	}
	try {
		const pool = await sql.connect(config);
		const request = pool.request();
		if (fecha) {
			query += `fecha = @fecha, `;
			request.input("fecha", sql.Date, fecha);
		}
		if (horaEntrada) {
			query += `hora_entrada = @horaEntrada, `;
			request.input("horaEntrada", sql.DateTime, horaEntrada);
		}
		if (typeof horaSalida === 'string' && horaSalida.toUpperCase() === "NULL") {
			query += `hora_salida = NULL, `;
		} else if (horaSalida) {
			query += `hora_salida = @horaSalida, `;
			request.input("horaSalida", sql.DateTime, horaSalida);
		}
		if (localizacionEntrada) {
			query += `localizacion_entrada = @localizacionEntrada, `;
			request.input("localizacionEntrada", sql.VarChar, localizacionEntrada);
		}
		if (typeof localizacionSalida === 'string' &&  localizacionSalida.toUpperCase() === "NULL") {
			query += `localizacion_salida = NULL, `;
		} else if (localizacionSalida) {
			query += `localizacion_salida = @localizacionSalida, `;
			request.input("localizacionSalida", sql.VarChar, localizacionSalida);
		}
		query = query.slice(0, -2); // Remove the last comma and space
		query += ` WHERE Id = @id`;
		request.input("id", sql.Int, id);
		const result = await request.query(query);
		return result;
	} catch (error) {
		console.error("Error al actualizar fichaje:", error.message);
		throw error;
	}
}

module.exports = {
	obtenerFichajesProyecto,
	eliminarFichajes,
	patchFichaje
};
