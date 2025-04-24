const sql = require("mssql");
const config = require("../config/dbConfig");
const { LocalDate } = require("@js-joda/core");
require("../shared/vacacion");

const darAltaEmpleado = async (
  id_admin,
  username,
  password,
  nombreApellidos,
  dni,
  segSocial,
  email,
  telefono,
  rol
) => {
  try {
    const pool = await sql.connect(config);

    // Verificar nombre de usuario existente
    const usuariosNombre = await pool
      .request()
      .input("user_name", sql.VarChar, username).query(`
				SELECT count(*) AS count
				FROM usuarios
				WHERE LOWER(user_name) = LOWER(@user_name);
			`);

    if (usuariosNombre.recordset[0].count !== 0) {
      return "Nombre de usuario en uso";
    }

    // Verificar DNI existente
    const usuariosDNI = await pool.request().input("dni", sql.VarChar, dni)
      .query(`
				SELECT count(*) AS count
				FROM usuarios
				WHERE UPPER(dni) = UPPER(@dni);
			`);

    if (usuariosDNI.recordset[0].count !== 0) {
      return "DNI en uso";
    }

    // Preparar inserción
    const request = pool
      .request()
      .input("id_admin", sql.Int, id_admin)
      .input("user_name", sql.VarChar, username)
      .input("contrasena", sql.VarChar, password)
      .input("nomapes", sql.VarChar, nombreApellidos)
      .input("dni", sql.VarChar, dni)
      .input("num_seguridad_social", sql.VarChar, segSocial)
      .input("rol", sql.VarChar, rol);

    if (email !== undefined) {
      request.input("email", sql.VarChar, email);
    }

    if (telefono !== undefined) {
      request.input("telefono", sql.VarChar, telefono);
    }

    // Generar consulta dinámica con campos opcionales
    let campos = `user_name, contrasena, nomapes, dni, num_seguridad_social, rol, id_empresa`;
    let valores = `@user_name, @contrasena, @nomapes, @dni, @num_seguridad_social, @rol, (SELECT id_empresa FROM usuarios WHERE id = @id_admin)`;

    if (email !== undefined) {
      campos += `, email`;
      valores += `, @email`;
    }
    if (telefono !== undefined) {
      campos += `, telefono`;
      valores += `, @telefono`;
    }

    const result = await request.query(`
			INSERT INTO usuarios (${campos})
			VALUES (${valores});
		`);

    if (result.rowsAffected[0] !== 1) {
      return "Error desconocido";
    }

    return;
  } catch (error) {
    console.error("Error al dar de alta a un nuevo empleado:", error);
    throw error;
  }
};

/**
 * @typedef FiltrosGetEmpleados
 * @prop {string | undefined} nombreApellidos Filtro para nomapes, o ningún filtro
 * @prop {string | undefined} username Filtro para user_name, o ningún filtro
 * @prop {string | undefined} dni Filtro para dni, o ningún filtro
 * @prop {string | undefined} seguridadSocial Filtro para num_seguridad_social, o ningún filtro
 * @prop {string | undefined} rol El rol del empleado.
 */

const ordenesEmpleadoValidos = [
  "id",
  "user_name",
  "nomapes",
  "dni",
  "num_seguridad_social",
  "rol",
];
/**
 * Consulta los empleados de la empresa de un administrador.
 * @param {number} id_admin La ID del administrador
 * @param {number} pagina La página a obtener
 * @param {number} empleadosPorPagina Los empleados por página
 * @param {string | undefined} ordenarPor El campo con el cual se ordenarán los resultados
 * @param {boolean} esAscendiente Si los resultados se ordenan ascendientemente
 * @param {FiltrosGetEmpleados | undefined} filtros Los filtros de la consulta
 */
const getEmpleados = async (
  id_admin,
  pagina,
  empleadosPorPagina,
  ordenarPor,
  esAscendiente,
  filtros
) => {
  try {
    // ordenesValidos es exportado para validar antes de llamar a getEmpleados
    if (!ordenesEmpleadoValidos.includes(ordenarPor)) {
      console.log("2")
      throw new Error("Orden inválido");
    }

    // Ademas de consultar los empleados, consultar el total de empleados
    // que cumplan con los filtros dados, esto se hace para habilitar
    // la paginación en el frontend
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id_admin", sql.Int, id_admin)
      .input("user_name", sql.VarChar, filtros?.username?.trim())
      .input("nomapes", sql.VarChar, filtros?.nombreApellidos?.trim())
      .input("dni", sql.VarChar, filtros?.dni?.trim())
      .input(
        "num_seguridad_social",
        sql.VarChar,
        filtros?.seguridadSocial?.trim()
      )
      .input("rol", sql.VarChar, filtros?.rol?.trim())
      .input("order", sql.VarChar, ordenarPor)
      .input("filas", sql.Int, empleadosPorPagina)
      .input("offset", sql.Int, (pagina - 1) * empleadosPorPagina).query(`
				SELECT id, user_name "username", nomapes "nombreApellidos", dni, num_seguridad_social "seguridadSocial", rol
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
    console.error(
      "Error al obtener empleados: ",
      id_admin,
      pagina,
      empleadosPorPagina,
      ordenarPor,
      esAscendiente,
      filtros
    );
    throw error;
  }
};

/**
 *
 * @param {FiltrosGetEmpleados | undefined} filtros
 */
const construirFiltros = (filtros) => {
  const query = [""];

  // Construir filtros
  if (filtros?.username && filtros.username.trim().length > 0) {
    query.push(
      "LOWER(user_name) COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE LOWER('%' + @user_name + '%')"
    );
  }

  if (filtros?.nombreApellidos && filtros.nombreApellidos.trim().length > 0) {
    query.push(
      "LOWER(nomapes) COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE LOWER('%' + @nomapes + '%')"
    );
  }

  if (filtros?.dni && filtros.dni.trim().length > 0) {
    query.push("LOWER(dni) LIKE LOWER('%' + @dni + '%')");
  }

  if (filtros?.seguridadSocial && filtros.seguridadSocial.trim().length > 0) {
    query.push(
      "LOWER(num_seguridad_social) LIKE LOWER('%' + @num_seguridad_social + '%')"
    );
  }

  if (filtros?.rol && filtros.rol.trim().length > 0) {
    query.push("rol = @rol");
  }

  return query.join(" AND ");
};

/**
 * Obtiene los datos (excepto contraseña) de un empleado.
 * @param {number} idEmpleado La id del empleado a consultar.
 */
const getDetalles = async (idEmpleado) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id", sql.Int, idEmpleado).query(`
				SELECT id, user_name "username", nomapes "nombreApellidos", dni, num_seguridad_social "seguridadSocial", email, telefono,rol, sexo
				FROM usuarios
				WHERE id = @id`);

    return result.recordset[0];
  } catch (error) {
    console.error("Error al obtener detalles del empleado: ", idEmpleado);
    throw error;
  }
};

const editarEmpleado = async (
  id_empleado,
  username,
  password,
  nombreApellidos,
  dni,
  seguridadSocial,
  email,
  telefono,
  rol,
  sexo
) => {
  let codigoError;

  try {
    const edicion = construirEdicion(
      username,
      password,
      nombreApellidos,
      dni,
      seguridadSocial,
      email,
      telefono,
      rol,
      sexo
    );

    const pool = await sql.connect(config);

    // Verificar duplicados por username o dni
    const duplicados = await pool
      .request()
      .input("user_name", sql.VarChar, username)
      .input("dni", sql.VarChar, dni.toUpperCase())
      .input("id", sql.Int, id_empleado).query(`
        SELECT COUNT(*) AS count
        FROM usuarios
        WHERE id <> @id
          AND (
            (LOWER(user_name) = LOWER(@user_name) AND user_name IS NOT NULL)
            OR
            (UPPER(dni) = @dni AND dni IS NOT NULL)
          );
      `);

    if (duplicados.recordset[0].count !== 0) {
      return 400;
    }
    const request = pool.request().input("id", sql.Int, id_empleado);

    for (const [campo, valor] of Object.entries(edicion.inputs)) {
      request.input(campo, sql.NVarChar, valor);
    }
    const result = await request.query(`
				UPDATE usuarios
				SET ${edicion.sql}
				WHERE id = @id;
			`);

    if (result.rowsAffected[0] !== 1) {
      codigoError = 500;
    }
    return codigoError;
  } catch (error) {
    console.error("Error al editar empleado: ", error);
    throw error;
  }
};

const construirEdicion = (
  username,
  password,
  nombreApellidos,
  dni,
  seguridadSocial,
  email,
  telefono,
  rol,
  sexo
) => {
  const query = [];
  const inputs = {};

  if (username && username.trim().length > 0) {
    query.push("user_name = @user_name");
    inputs.user_name = username;
  }

  if (password && password.length > 0) {
    query.push("contrasena = @contrasena");
    inputs.contrasena = password;
  }

  if (nombreApellidos && nombreApellidos.trim().length > 0) {
    query.push("nomapes = @nomapes");
    inputs.nomapes = nombreApellidos;
  }

  if (dni && dni.trim().length > 0) {
    query.push("dni = @dni");
    inputs.dni = dni;
  }

  if (seguridadSocial && seguridadSocial.trim().length > 0) {
    query.push("num_seguridad_social = @num_seguridad_social");
    inputs.num_seguridad_social = seguridadSocial;
  }

  if (rol && rol.trim().length > 0) {
    query.push("rol = @rol");
    inputs.rol = rol;
  }

  if (telefono !== undefined) {
    query.push("telefono = @telefono");
    inputs.telefono = telefono.trim() === "" ? null : telefono;
  }

  if (email !== undefined) {
    query.push("email = @email");
    inputs.email = email.trim() === "" ? null : email;
  }

  if (sexo && sexo.trim().length > 0) {
    query.push("sexo = @sexo");
    inputs.sexo = sexo;
  }

  return {
    sql: query.join(", "),
    inputs,
  };
};

const actualizarVacacion = async (idVacacion, idAdmin, estado, razon) => {
  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input("id_vacacion", sql.Int, idVacacion)
      .input("administrador", sql.Int, idAdmin)
      .input("estado", sql.VarChar, estado)
      .input("razon", sql.VarChar, razon).query(`
				INSERT INTO VACACIONES_ESTADOS
				(id_vacacion, tiempo, administrador, estado, razon)
				VALUES
				(@id_vacacion, CURRENT_TIMESTAMP, @administrador, @estado, @razon);
			`);
  } catch (error) {
    console.error(
      "Error al actualizar el estado de vacación: ",
      idVacacion,
      idAdmin,
      estado,
      razon
    );
    throw error;
  }
};

/**
 * @typedef FiltrosGetVacaciones
 * @prop {string | undefined} empleado Filtro para nomapes.
 * @prop {EstadoVacacion | undefined} estado Filtro para estado de vacación.
 * @prop {string | undefined} fecha Filtro: obtiene vacaciones que contengan la fecha dada (formato 'YYYY-MM-DD').
 * @prop {string | undefined} tipo Filtro: nombre del tipo de vacación.
 */

const ordenesVacacionValidos = [
  "id",
  "empleado",
  "comienzo",
  "fin",
  "dias",
  "tipo",
  "estado",
];

/**
 * Mapea los campos de ordenamiento del frontend a los nombres de columnas/alias en la consulta SQL.
 */
const mapeoOrdenVacaciones = {
  id: "vacation_id", // Usamos el alias de la CTE
  empleado: "nomapes",
  comienzo: "FechaComienzo",
  fin: "FechaFin",
  dias: "TotalDias",
  tipo: "TipoNombre",
  estado: "EstadoFinal",
};

/**
 * Consulta las vacaciones con filtros, ordenamiento y paginación.
 * @param {number} idAdmin ID del administrador.
 * @param {number} pagina La página a obtener (base 1).
 * @param {number} itemsPorPagina Las filas a obtener.
 * @param {string | undefined} ordenarPor El campo con el cual se ordenarán los resultados ('id', 'empleado', 'comienzo', 'fin', 'dias', 'tipo', 'estado').
 * @param {boolean | undefined} esAscendiente Si los resultados se ordenan ascendentemente (true) o descendentemente (false).
 * @param {FiltrosGetVacaciones | undefined} filtros Los filtros de la consulta.
 * @returns {Promise<{vacaciones: VacationSummary[], total: number}>} Objeto con el array de vacaciones paginadas y el total de items.
 */
const getVacaciones = async (
  idAdmin,
  pagina,
  itemsPorPagina,
  ordenarPor,
  esAscendiente,
  filtros
) => {
  try {
    // Determinar la columna SQL y la dirección de ordenamiento
    const columnaOrdenPrincipal =
      mapeoOrdenVacaciones[ordenarPor] || "vacation_id";
    const direccionOrden = esAscendiente === true ? "ASC" : "DESC";

    // Construir la cláusula ORDER BY dinámicamente
    let ordenamientoSQL = `ORDER BY ${columnaOrdenPrincipal} ${direccionOrden}`;

    // Añadir el ordenamiento secundario por vacation_id SOLO si el orden primario no es ya vacation_id
    if (columnaOrdenPrincipal !== "vacation_id") {
      // Usar la misma dirección para el ordenamiento secundio para consistencia, o usar 'ASC' fijo si se prefiere
      ordenamientoSQL += `, vacation_id ${direccionOrden}`;
    }

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("id_admin", sql.Int, idAdmin);
    request.input(
      "nomapes",
      sql.VarChar,
      filtros?.empleado?.trim()?.toLowerCase()
    );
    request.input("estado", sql.VarChar, filtros?.estado);
    request.input(
      "tipoNombre",
      sql.VarChar,
      filtros?.tipo?.trim()?.toLowerCase()
    );
    request.input("fecha", sql.Date, filtros?.fecha);

    // Parámetros para la paginación OFFSET/FETCH NEXT
    request.input("filas", sql.Int, itemsPorPagina);
    request.input("offset", sql.Int, (pagina - 1) * itemsPorPagina);

    const result = await request.query(`
            -- Declarar la variable de tabla ANTES de las CTEs
            DECLARE @FilteredVacations TABLE (
                vacation_id INT,
                nomapes VARCHAR(50), -- Asegúrate que el tamaño coincide con USUARIOS.nomapes
                FechaComienzo DATE,
                FechaFin DATE,
                TotalDias INT,
                TipoNombre VARCHAR(50), -- Asegúrate que el tamaño coincide con TIPOS_VACACION.nombre
                EstadoFinal VARCHAR(9) -- Asegúrate que el tamaño coincide con VACACIONES_ESTADOS.estado
                -- No necesitamos id_usuario o id_empresa en la variable de tabla si solo se usan para el filtro de inserción
            );

            -- CTEs para preparar los datos y aplicar filtros *antes* de insertar en la variable de tabla
            WITH LatestStates AS (
                SELECT
                    ves.id_vacacion,
                    ves.estado
                FROM VACACIONES_ESTADOS ves
                INNER JOIN (
                    SELECT id_vacacion, MAX(tiempo) AS max_tiempo
                    FROM VACACIONES_ESTADOS
                    GROUP BY id_vacacion
                ) AS latest_state_time ON ves.id_vacacion = latest_state_time.id_vacacion AND ves.tiempo = latest_state_time.max_tiempo
            ),
            VacationDetailsAggregated AS (
                SELECT
                    v.id AS vacation_id,
                    v.id_usuario,
                    v.tipo AS vacation_type_id,
                    MIN(dv.dia) AS FechaComienzo,
                    MAX(dv.dia) AS FechaFin,
                    COUNT(dv.dia) AS TotalDias
                FROM VACACIONES v
                INNER JOIN DIAS_VACACION dv ON v.id = dv.id_vacacion
                GROUP BY v.id, v.id_usuario, v.tipo
            ),
            VacationsWithFinalState AS (
                 SELECT
                    vd.vacation_id,
                    vd.id_usuario,
                    vd.vacation_type_id,
                    vd.FechaComienzo,
                    vd.FechaFin,
                    vd.TotalDias,
                    ISNULL(ls.estado, 'pendiente') AS EstadoFinal
                 FROM VacationDetailsAggregated vd
                 LEFT JOIN LatestStates ls ON vd.vacation_id = ls.id_vacacion
            ),
            -- CTE para unir con usuarios y tipos, y aplicar *todos* los filtros, antes de insertar en la variable de tabla
            SourceForFilteredVacations AS ( -- Renombrada para claridad
                 SELECT
                    vwfs.vacation_id, -- Seleccionamos columnas específicas para insertar en la variable de tabla
                    u.nomapes,
                    vwfs.FechaComienzo,
                    vwfs.FechaFin,
                    vwfs.TotalDias,
                    t.nombre AS TipoNombre,
                    vwfs.EstadoFinal
                 FROM VacationsWithFinalState vwfs
                 INNER JOIN USUARIOS u ON vwfs.id_usuario = u.id
                 INNER JOIN TIPOS_VACACION t ON vwfs.vacation_type_id = t.id
                 WHERE u.id_empresa = (SELECT id_empresa FROM USUARIOS WHERE id = @id_admin) -- Filtro de autorización
                 AND (@nomapes IS NULL OR u.nomapes COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE '%' + @nomapes + '%')
                 AND (@tipoNombre IS NULL OR t.nombre COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE '%' + @tipoNombre + '%')
                 AND (@estado IS NULL OR vwfs.EstadoFinal = @estado) -- Filtro estado
                 -- Filtro por fecha
                 AND (@fecha IS NULL OR EXISTS (SELECT 1 FROM DIAS_VACACION dv_filter WHERE dv_filter.id_vacacion = vwfs.vacation_id AND dv_filter.dia = @fecha))
            )
            -- Insertar los resultados filtrados en la variable de tabla
            INSERT INTO @FilteredVacations (
                vacation_id, nomapes, FechaComienzo, FechaFin, TotalDias, TipoNombre, EstadoFinal
            )
            SELECT
                vacation_id, nomapes, FechaComienzo, FechaFin, TotalDias, TipoNombre, EstadoFinal
            FROM SourceForFilteredVacations;

            -- Primera Consulta: Seleccionar los datos paginados DESDE la variable de tabla
            SELECT
                vacation_id AS id,
                nomapes AS empleado,
                CONVERT(VARCHAR(10), FechaComienzo, 120) AS comienzo,
                CONVERT(VARCHAR(10), FechaFin, 120) AS fin,
                TotalDias AS dias,
                EstadoFinal AS estado,
                TipoNombre AS tipo
            FROM @FilteredVacations -- <-- Selecciona desde la variable de tabla
            ${ordenamientoSQL} -- Cláusula ORDER BY construida dinámicamente
            OFFSET @offset ROWS
            FETCH NEXT @filas ROWS ONLY;

            -- Segunda Consulta: Contar el total de items DESDE la misma variable de tabla
            SELECT
                COUNT(*) AS total
            FROM @FilteredVacations; -- <-- Cuenta desde la variable de tabla

        `);

    const vacacionesPaginadas = result.recordsets[0]; // Resultado de la primera SELECT (los datos paginados)
    const totalItemsResult = result.recordsets[1]; // Resultado de la segunda SELECT (el conteo total)

    const totalItems =
      totalItemsResult.length > 0 ? totalItemsResult[0].total : 0;

    return {
      vacaciones: vacacionesPaginadas,
      total: totalItems,
    };
  } catch (error) {
    console.error(
      "Error al obtener vacaciones: ",
      idAdmin,
      pagina,
      itemsPorPagina,
      ordenarPor,
      esAscendiente,
      filtros
    );
    throw error;
  }
};

/**
 * Obtiene los detalles de una vacación.
 * @param {number} idVacacion ID de la vacación.
 */
const getVacacion = async (idVacacion) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("VacationId", sql.Int, idVacacion)
      .query(`
				-- Primera Consulta: Detalles principales (empleado, tipo, estado)
				SELECT TOP 1 -- Debería haber solo una vacación con este ID
					u.nomapes AS empleado,
					t.nombre AS tipo,
					-- Determinar el estado: el estado más reciente de VACACIONES_ESTADOS o 'pendiente' si no hay estados
					ISNULL(ls.estado, 'pendiente') AS estado
				FROM VACACIONES v
				INNER JOIN USUARIOS u ON v.id_usuario = u.id -- Unir con USUARIOS para obtener el nombre del empleado
				INNER JOIN TIPOS_VACACION t ON v.tipo = t.id -- Unir con TIPOS_VACACION para obtener el nombre del tipo
				LEFT JOIN (
					-- Subconsulta para encontrar la única fila del estado más reciente para esta vacación específica
					SELECT TOP 1 estado
					FROM VACACIONES_ESTADOS
					WHERE id_vacacion = @VacationId -- Filtrar por el ID de la vacación
					ORDER BY tiempo DESC -- Ordenar por tiempo descendente para obtener el más reciente
				) AS ls ON 1=1 -- Unir con condición "siempre verdadera" para traer la fila de la subconsulta si existe
				WHERE v.id = @VacationId; -- Filtrar la vacación principal por su ID

				-- Segunda Consulta: Días de la vacación (formateados como cadenas 'YYYY-MM-DD')
				SELECT
					CONVERT(VARCHAR(10), dia, 120) AS dia_formato -- Usar CONVERT con estilo 120 para 'YYYY-MM-DD'
				FROM DIAS_VACACION
				WHERE id_vacacion = @VacationId -- Filtrar por el ID de la vacación
				ORDER BY dia ASC; -- Ordenar los días cronológicamente
        `);

    // Verificar si se encontró la vacación principal (el primer recordset no está vacío)
    if (
      !result.recordsets ||
      result.recordsets.length === 0 ||
      result.recordsets[0].length === 0
    ) {
      return null;
    }

    const detalles = result.recordsets[0][0];

    const dias =
      result.recordsets.length > 1 && result.recordsets[1].length > 0
        ? result.recordsets[1].map((row) => row.dia_formato)
        : [];

    return {
      empleado: detalles.empleado,
      tipo: detalles.tipo,
      estado: detalles.estado,
      dias: dias,
    };
  } catch (error) {
    console.error("Error al obtener detalles de vacación: ", idVacacion);
    throw error;
  }
};

const getCambiosEstado = async (idVacacion) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id_vacacion", sql.Int, idVacacion).query(`
				SELECT CONVERT(VARCHAR, tiempo, 120) "tiempo", (
					SELECT nomapes FROM USUARIOS WHERE id = administrador
				) "administrador", estado, razon
				FROM VACACIONES_ESTADOS
				WHERE id_vacacion = @id_vacacion;
			`);

    return result.recordset;
  } catch (error) {
    console.error(
      "Error al obtener cambios de estado de vacación: ",
      idVacacion
    );
    throw error;
  }
};

module.exports = {
  darAltaEmpleado,
  getEmpleados,
  getDetalles,
  editarEmpleado,
  actualizarVacacion,
  ordenesEmpleadoValidos,
  ordenesVacacionValidos,
  getVacaciones,
  getVacacion,
  getCambiosEstado,
};
