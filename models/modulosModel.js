const sql = require("mssql");
const config = require("../config/dbConfig");

// Obtener todos los módulos
const obtenerModulos = async (id_empresa) => {
  const pool = await sql.connect(config);

  try {
    const result = await pool.request().input("id_empresa", sql.Int, id_empresa)
      .query(`
        SELECT 
          m.id AS modulo_id,
          m.nombre AS modulo_nombre,
          m.clave_modulo,
          ISNULL(em.habilitado, 0) AS modulo_habilitado,
          s.id AS submodulo_id,
          s.nombre AS submodulo_nombre,
          s.clave AS submodulo_clave,
          ISNULL(es.habilitado, 0) AS submodulo_habilitado
        FROM MODULOS m
        LEFT JOIN EMPRESAS_MODULOS em ON em.id_modulo = m.id AND em.id_empresa = @id_empresa
        LEFT JOIN SUBMODULOS s ON s.id_modulo = m.id
        LEFT JOIN EMPRESAS_SUBMODULOS es ON es.id_submodulo = s.id AND es.id_empresa = @id_empresa
        ORDER BY m.id, s.id;
      `);

    const resultado = [];
    const modulosMap = new Map();

    for (const row of result.recordset) {
      const moduloId = row.modulo_id;

      if (!modulosMap.has(moduloId)) {
        const nuevoModulo = {
          id: moduloId,
          nombre: row.modulo_nombre,
          clave_modulo: row.clave_modulo,
          habilitado: !!row.modulo_habilitado,
          submodulos: [],
        };

        modulosMap.set(moduloId, nuevoModulo);
        resultado.push(nuevoModulo);
      }

      if (row.submodulo_id) {
        const submodulo = {
          id: row.submodulo_id,
          nombre: row.submodulo_nombre,
          clave: row.submodulo_clave,
          habilitado: !!row.submodulo_habilitado,
        };
        modulosMap.get(moduloId).submodulos.push(submodulo);
      }
    }

    return resultado;
  } catch (error) {
    console.error("Error al obtener módulos habilitados:", error.message);
    throw new Error("No se pudieron obtener los módulos");
  } finally {
    pool.close();
  }
};

// Crear un nuevo módulo
const crearModulo = async (nombre, clave_modulo) => {
  const pool = await sql.connect(config);
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

// Crear un nuevo submódulo
const crearSubmodulo = async (id_modulo, nombre, clave) => {
  const pool = await sql.connect(config);
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
const actualizarModulosEmpresa = async (idEmpresa, modulos) => {
  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    for (const modulo of modulos) {
      // Upsert módulo
      await new sql.Request(transaction)
        .input("id_empresa", sql.Int, idEmpresa)
        .input("id_modulo", sql.Int, modulo.id)
        .input("habilitado", sql.Bit, modulo.habilitado).query(`
          MERGE EMPRESAS_MODULOS AS target
          USING (SELECT @id_empresa AS id_empresa, @id_modulo AS id_modulo) AS source
          ON target.id_empresa = source.id_empresa AND target.id_modulo = source.id_modulo
          WHEN MATCHED THEN UPDATE SET habilitado = @habilitado
          WHEN NOT MATCHED THEN
            INSERT (id_empresa, id_modulo, habilitado)
            VALUES (@id_empresa, @id_modulo, @habilitado);
        `);

      for (const sub of modulo.submodulos) {
        await new sql.Request(transaction)
          .input("id_submodulo", sql.Int, sub.id)
          .input("id_empresa", sql.Int, idEmpresa)
          .input("habilitado", sql.Bit, sub.habilitado).query(`
            MERGE EMPRESAS_SUBMODULOS AS target
            USING (SELECT @id_empresa AS id_empresa, @id_submodulo AS id_submodulo) AS source
            ON target.id_empresa = source.id_empresa AND target.id_submodulo = source.id_submodulo
            WHEN MATCHED THEN UPDATE SET habilitado = @habilitado
            WHEN NOT MATCHED THEN
              INSERT (id_empresa, id_submodulo, habilitado)
              VALUES (@id_empresa, @id_submodulo, @habilitado);
          `);
      }
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    pool.close();
  }
};

module.exports = {
  obtenerModulos,
  crearModulo,
  crearSubmodulo,
  actualizarModulosEmpresa,
};
