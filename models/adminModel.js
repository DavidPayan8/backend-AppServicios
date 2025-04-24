const sql = require("mssql");
const config = require("../config/dbConfig");

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

const ordenesValidos = [
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
    inputs.telefono = telefono.trim() === '' ? null : telefono;
  }
  
  if (email !== undefined) {
    query.push("email = @email");
    inputs.email = email.trim() === '' ? null : email;
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

module.exports = {
  darAltaEmpleado,
  getEmpleados,
  getDetalles,
  editarEmpleado,
  ordenesValidos,
};
