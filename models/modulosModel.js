const sql = require("mssql");
const config = require("../config/dbConfig");

// Obtener todos los módulos
exports.obtenerModulos = async () => {
  const pool = await config.connect();
  try {
    const result = await pool.request().query("SELECT * FROM MODULOS");
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener módulos:", error.message);
    throw new Error("No se pudieron obtener los módulos");
  } finally {
    pool.close();
  }
};

// Crear un nuevo módulo
exports.crearModulo = async (nombre, clave_modulo) => {
  const pool = await config.connect();
  try {
    const query = `
      INSERT INTO MODULOS (nombre, clave_modulo)
      VALUES (@nombre, @clave_modulo)
    `;

    await pool
      .request()
      .input("nombre", sql.NVarChar, nombre)
      .input("clave_modulo", sql.NVarChar, clave_modulo)
      .query(query);

    return { message: "Módulo creado correctamente" };
  } catch (error) {
    console.error("Error al crear módulo:", error.message);
    throw new Error("No se pudo crear el módulo");
  } finally {
    pool.close();
  }
};

// Obtener todos los submódulos
exports.obtenerSubmodulos = async () => {
  const pool = await config.connect();
  try {
    const result = await pool.request().query("SELECT * FROM SUBMODULOS");
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener submódulos:", error.message);
    throw new Error("No se pudieron obtener los submódulos");
  } finally {
    pool.close();
  }
};

// Crear un nuevo submódulo
exports.crearSubmodulo = async (id_modulo, nombre, clave) => {
  const pool = await config.connect();
  try {
    const query = `
      INSERT INTO SUBMODULOS (id_modulo, nombre, clave)
      VALUES (@id_modulo, @nombre, @clave)
    `;

    await pool
      .request()
      .input("id_modulo", sql.Int, id_modulo)
      .input("nombre", sql.NVarChar, nombre)
      .input("clave", sql.NVarChar, clave)
      .query(query);

    return { message: "Submódulo creado correctamente" };
  } catch (error) {
    console.error("Error al crear submódulo:", error.message);
    throw new Error("No se pudo crear el submódulo");
  } finally {
    pool.close();
  }
};

// Vincular un módulo a una empresa
exports.vincularModuloEmpresa = async (
  id_empresa,
  id_modulo,
  habilitado = 1
) => {
  const pool = await config.connect();
  try {
    const query = `
      INSERT INTO EMPRESAS_MODULOS (id_empresa, id_modulo, habilitado)
      VALUES (@id_empresa, @id_modulo, @habilitado)
    `;

    await pool
      .request()
      .input("id_empresa", sql.Int, id_empresa)
      .input("id_modulo", sql.Int, id_modulo)
      .input("habilitado", sql.Bit, habilitado)
      .query(query);

    return { message: "Módulo vinculado correctamente a la empresa" };
  } catch (error) {
    console.error("Error al vincular módulo a empresa:", error.message);
    throw new Error("No se pudo vincular el módulo a la empresa");
  } finally {
    pool.close();
  }
};

// Vincular un submódulo a una empresa
exports.vincularSubmoduloEmpresa = async (
  id_empresa,
  id_submodulo,
  habilitado = 1
) => {
  const pool = await config.connect();
  try {
    const query = `
      INSERT INTO EMPRESAS_SUBMODULOS (id_empresa, id_submodulo, habilitado)
      VALUES (@id_empresa, @id_submodulo, @habilitado)
    `;

    await pool
      .request()
      .input("id_empresa", sql.Int, id_empresa)
      .input("id_submodulo", sql.Int, id_submodulo)
      .input("habilitado", sql.Bit, habilitado)
      .query(query);

    return { message: "Submódulo vinculado correctamente a la empresa" };
  } catch (error) {
    console.error("Error al vincular submódulo a empresa:", error.message);
    throw new Error("No se pudo vincular el submódulo a la empresa");
  } finally {
    pool.close();
  }
};
