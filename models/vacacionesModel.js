const sql = require("mssql");
const config = require("../config/dbConfig");
const {
  LocalDate,
  DateTimeFormatter,
  ZoneId,
  DayOfWeek,
} = require("@js-joda/core");
const { Locale } = require("@js-joda/locale_es");
require("@js-joda/timezone");

const obtenerTotalVacaciones = async (idUsuario) => {
  try {
    const pool = await sql.connect(config);

    const vacaciones = {
      aceptadas: 0,
      solicitadas: 0,
      pendientes: 0,
    };

    // Consulta la cantidad de días de vacación
    const resultVacaciones = await pool
      .request()
      .input("userId", sql.Int, idUsuario).query(`
				-- CTE para obtener el estado más reciente de cada vacación que tiene estados registrados
				WITH LatestVacationState AS (
					SELECT
						ve.id_vacacion,
						ve.estado
					FROM dbo.VACACIONES_ESTADOS ve
					INNER JOIN (
						SELECT id_vacacion, MAX(tiempo) AS MaxTiempo
						FROM dbo.VACACIONES_ESTADOS
						GROUP BY id_vacacion
					) latest ON ve.id_vacacion = latest.id_vacacion AND ve.tiempo = latest.MaxTiempo
				)
				-- Primera Consulta: Total de días ACEPTADOS
				SELECT COUNT(dv.dia) AS TotalDiasAceptados
				FROM dbo.VACACIONES v
				INNER JOIN LatestVacationState lvs ON v.id = lvs.id_vacacion
				INNER JOIN dbo.DIAS_VACACION dv ON v.id = dv.id_vacacion
				WHERE v.id_usuario = @userId AND lvs.estado = 'aceptado';

				-- Segunda Consulta: Total de días SOLICITADOS
				WITH LatestVacationState AS (
					SELECT
						ve.id_vacacion,
						ve.estado
					FROM dbo.VACACIONES_ESTADOS ve
					INNER JOIN (
						SELECT id_vacacion, MAX(tiempo) AS MaxTiempo
						FROM dbo.VACACIONES_ESTADOS
						GROUP BY id_vacacion
					) latest ON ve.id_vacacion = latest.id_vacacion AND ve.tiempo = latest.MaxTiempo
				),
				UserVacationsWithCurrentState AS (
					SELECT
						v.id AS id_vacacion,
						COALESCE(lvs.estado, 'solicitado') AS CurrentEstado
					FROM dbo.VACACIONES v
					LEFT JOIN LatestVacationState lvs ON v.id = lvs.id_vacacion
					WHERE v.id_usuario = @userId
				)
				SELECT COUNT(dv.dia) AS TotalDiasSolicitados
				FROM UserVacationsWithCurrentState uvwcs
				INNER JOIN dbo.DIAS_VACACION dv ON uvwcs.id_vacacion = dv.id_vacacion
				WHERE uvwcs.CurrentEstado = 'solicitado';
			`);

    vacaciones.solicitadas =
      resultVacaciones.recordsets[1][0]?.TotalDiasSolicitados || 0;
    vacaciones.aceptadas =
      resultVacaciones.recordsets[0][0]?.TotalDiasAceptados || 0;
    const total = vacaciones.aceptadas + vacaciones.solicitadas;

    // Consulta la cantidad de días disponibles en los tipos de vacación
    const resultTipos = await pool
      .request()
      .input("id_usuario", sql.Int, idUsuario).query(`
			SELECT SUM(COALESCE(cantidad_dias, 0)) "dias"
			FROM tipos_vacacion
			WHERE id_empresa IS NULL OR id_empresa = (SELECT id_empresa FROM usuarios WHERE id = @id_usuario);`);

    vacaciones.pendientes = resultTipos.recordset[0].dias - total;

    return vacaciones;
  } catch (error) {
    console.error("Error al obtener vacaciones: ", idUsuario);
    throw error;
  }
};

const obtenerTiposVacacion = async (empresa) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id_empresa", sql.Int, empresa)
      .query(`
				SELECT id, nombre, cantidad_dias "dias", es_dias_naturales
				FROM tipos_vacacion
				WHERE id_empresa = @id_empresa;`);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener tipos de vacacion.");
    throw error;
  }
};

/**
 *
 * @param {number} idUsuario ID del usuario consultando las vacaciones.
 * @param {number} tipo Tipo de vacaciones a consultar.
 * @returns Las vacaciones solicitadas del usuario.
 */
const obtenerVacacionesSolicitadas = async (idUsuario, tipo) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("UserId", sql.Int, idUsuario)
      .input("TipoId", sql.Int, tipo).query(`
				WITH LatestStates AS (
					-- CTE para encontrar el estado más reciente para cada vacación que tiene estados
					SELECT
						ves.id_vacacion,
						ves.estado
					FROM VACACIONES_ESTADOS ves
					INNER JOIN (
						-- Encuentra el tiempo máximo para cada vacación
						SELECT id_vacacion, MAX(tiempo) AS max_tiempo
						FROM VACACIONES_ESTADOS
						GROUP BY id_vacacion
					) AS latest_state_time ON ves.id_vacacion = latest_state_time.id_vacacion AND ves.tiempo = latest_state_time.max_tiempo
				)
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia -- Día de la vacación en formato 'YYYY-MM-DD'
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id -- Une con la tabla de vacaciones para filtrar por usuario y tipo
				LEFT JOIN LatestStates ls ON v.id = ls.id_vacacion -- Intenta unir con el estado más reciente (si existe)
				WHERE v.id_usuario = @UserId -- Filtra por el ID del usuario
				AND v.tipo = @TipoId -- Filtra por el tipo de vacación
				AND (
					ls.estado IS NULL -- Incluye vacaciones sin estado (se consideran 'solicitado')
					OR ls.estado = 'solicitado' -- Incluye vacaciones cuyo estado más reciente es 'solicitado'
				);
			`);

    // Selecciono dia como una cadena para evitar que mssql
    // convierta al dia a un Date de JavaScript

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener vacaciones.");
    throw error;
  }
};

const obtenerVacacionesAceptadas = async (idUsuario, tipo) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("UserId", sql.Int, idUsuario)
      .input("TipoId", sql.Int, tipo).query(`
				WITH LatestStates AS (
					-- CTE para encontrar el estado más reciente para cada vacación que tiene estados
					SELECT
						ves.id_vacacion,
						ves.estado
					FROM VACACIONES_ESTADOS ves
					INNER JOIN (
						-- Encuentra el tiempo máximo para cada vacación
						SELECT id_vacacion, MAX(tiempo) AS max_tiempo
						FROM VACACIONES_ESTADOS
						GROUP BY id_vacacion
					) AS latest_state_time ON ves.id_vacacion = latest_state_time.id_vacacion AND ves.tiempo = latest_state_time.max_tiempo
				)
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia -- Día de la vacación en formato 'YYYY-MM-DD'
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id -- Une con la tabla de vacaciones para filtrar por usuario y tipo
				LEFT JOIN LatestStates ls ON v.id = ls.id_vacacion -- Intenta unir con el estado más reciente (si existe)
				WHERE v.id_usuario = @UserId -- Filtra por el ID del usuario
				AND v.tipo = @TipoId -- Filtra por el tipo de vacación
				AND ls.estado = 'aceptado'; -- Filtra solo las que tienen estado 'aceptado' como el más reciente
			`);

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener vacaciones.");
    throw error;
  }
};

const obtenerVacacionesDenegadas = async (idUsuario, tipo) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("UserId", sql.Int, idUsuario)
      .input("TipoId", sql.Int, tipo).query(`
				WITH LatestStates AS (
					-- CTE para encontrar el estado, el tiempo y la razon del estado más reciente
					-- para cada vacación que tiene estados.
					SELECT
						ves.id_vacacion,
						ves.estado,
						ves.razon -- Incluimos la razon del estado más reciente
					FROM VACACIONES_ESTADOS ves
					INNER JOIN (
						-- Encuentra el tiempo máximo para cada vacación
						SELECT id_vacacion, MAX(tiempo) AS max_tiempo
						FROM VACACIONES_ESTADOS
						GROUP BY id_vacacion
					) AS latest_state_time ON ves.id_vacacion = latest_state_time.id_vacacion AND ves.tiempo = latest_state_time.max_tiempo
				)
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia, -- Día de la vacación en formato 'YYYY-MM-DD'
					ls.razon -- Seleccionamos la razon del estado más reciente (que filtraremos para que sea 'denegado')
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id -- Une con la tabla de vacaciones para filtrar por usuario y tipo
				INNER JOIN LatestStates ls ON v.id = ls.id_vacacion -- Une con el estado más reciente. Usamos INNER JOIN porque solo nos interesan las vacaciones *con* un estado denegado explícito.
				WHERE v.id_usuario = @UserId -- Filtra por el ID del usuario
				AND v.tipo = @TipoId -- Filtra por el tipo de vacación
				AND ls.estado = 'denegado'; -- Filtra solo las que tienen estado 'denegado' como el más reciente
			`);

    return result.recordset;
  } catch (error) {
    console.error("Error al obtener vacaciones.");
    throw error;
  }
};

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
    const formatter = DateTimeFormatter.ofPattern("YYYY-MM-dd").withLocale(
      new Locale("es", "ES", "es")
    );

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
        .input("fecha", sql.Date, dia.format(formatter)).query(`
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
      .query(`INSERT INTO vacaciones (tipo, id_usuario, aceptado)
					OUTPUT INSERTED.id
					VALUES (@tipo, @id_usuario, 0)`);

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
};

/**
 * Verifica que el día sea después del día actual y que sea un día de semana.
 * @param {LocalDate} dia El día
 * @returns {boolean}
 */
const esDiaValido = (dia) => {
  const dayOfWeek = dia.dayOfWeek();
  const hoy = LocalDate.now(ZoneId.of("Europe/Madrid"));
  return (
    dia.isAfter(hoy) &&
    dayOfWeek !== DayOfWeek.SATURDAY &&
    dayOfWeek !== DayOfWeek.SUNDAY
  );
};

module.exports = {
  obtenerTotalVacaciones,
  obtenerTiposVacacion,
  obtenerVacacionesSolicitadas,
  obtenerVacacionesAceptadas,
  obtenerVacacionesDenegadas,
  solicitarVacaciones,
};
