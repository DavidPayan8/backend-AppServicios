const sql = require("mssql");
const config = require("../config/dbConfig");

const getColorPrincipal = async (empresaId) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().input("id_empresa", sql.Int, empresaId)
      .query(`
          SELECT ce.color_principal
          FROM config_empresa ce
          WHERE ce.id_empresa = @id_empresa
        `);

    // Si se encuentra el color, lo retornamos.
    return result.recordset[0].color_primario || "#0d5c91";
  } catch (error) {
    console.error("Error al obtener el color principal:", error.message);
    throw error;
  }
};

const getEmpresa = async (empresaId) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().input("id_empresa", sql.Int, empresaId)
      .query(`
          SELECT 
            e.id_empresa AS id, 
            e.nombre, 
            e.razon_social, 
            e.telefono, 
            e.direccion, 
            e.cif,
            ce.es_tipo_obra,
            ce.email_entrante, 
            ce.smtp_host, 
            ce.smtp_user, 
            ce.smtp_port, 
            ce.smtp_pass,
            ce.hay_primer_inicio,
            ce.color_principal
          FROM empresa e
          LEFT JOIN config_empresa ce ON e.id_empresa = ce.id_empresa
          WHERE e.id_empresa = @id_empresa
        `);

    if (!result.recordset.length) return null;

    const raw = result.recordset[0];

    return {
      id: raw.id,
      nombre: raw.nombre,
      razonSocial: raw.razon_social,
      telefono: raw.telefono,
      direccion: raw.direccion,
      cif: raw.cif,
      configuracion: {
        app: {
          hayPrimerInicio: raw.hay_primer_inicio,
          colorPrimario: raw.color_primario,
          esTipoObra: raw.es_tipo_obra,
        },
        email: {
          email: raw.email_entrante,
          smtp_host: raw.smtp_host,
          smtp_user: raw.smtp_user,
          smtp_port: raw.smtp_port,
          smtp_pass: raw.smtp_pass,
        },
      },
    };
  } catch (error) {
    console.error("Error al obtener empresa:", error.message);
    throw error;
  }
};

const updateEmpresa = async (empresa) => {
  try {
    const pool = await sql.connect(config);

    const updates = [];
    const request = pool.request();

    // Campos de la tabla empresa
    if (empresa.nombre) {
      updates.push("nombre = @nombre");
      request.input("nombre", sql.NVarChar, empresa.nombre);
    }
    if (empresa.cif) {
      updates.push("cif = @cif");
      request.input("cif", sql.NVarChar, empresa.cif);
    }
    if (empresa.razonSocial) {
      updates.push("razon_social = @razonSocial");
      request.input("razonSocial", sql.NVarChar, empresa.razonSocial);
    }
    updates.push("direccion = @direccion");
    request.input("direccion", sql.NVarChar, empresa.direccion);

    updates.push("telefono = @telefono");
    request.input("telefono", sql.NVarChar, empresa.telefono);

    // Solo actualizamos si hay algo que modificar
    if (updates.length > 0) {
      await request.input("id_empresa", sql.Int, empresa.id).query(`
            UPDATE empresa
            SET ${updates.join(", ")}
            WHERE id_empresa = @id_empresa
          `);
    }
    /* 
    // Ahora actualizamos la tabla de configuración si hay datos
    if (!empresa.configuracion) {
        return
    }
      const configUpdates = [];
      const configRequest = pool.request();

      // Configuración email
      if (empresa.configuracion.email?.email) {
        configUpdates.push("email_entrante = @email");
        configRequest.input(
          "email",
          sql.NVarChar,
          empresa.configuracion.email.email
        );
      }
      if (empresa.configuracion.email?.smtp_host) {
        configUpdates.push("smtp_host = @smtp_host");
        configRequest.input(
          "smtp_host",
          sql.NVarChar,
          empresa.configuracion.email.smtp_host
        );
      }
      if (empresa.configuracion.email?.smtp_port) {
        configUpdates.push("smtp_port = @smtp_port");
        configRequest.input(
          "smtp_port",
          sql.NVarChar,
          empresa.configuracion.email.smtp_port
        );
      }
      if (empresa.configuracion.email?.smtp_user) {
        configUpdates.push("smtp_user = @smtp_user");
        configRequest.input(
          "smtp_user",
          sql.NVarChar,
          empresa.configuracion.email.smtp_user
        );
      }
      if (empresa.configuracion.email?.smtp_pass) {
        configUpdates.push("smtp_pass = @smtp_pass");
        configRequest.input(
          "smtp_pass",
          sql.NVarChar,
          empresa.configuracion.email.smtp_pass
        );
      }

      // Configuración app
      if (empresa.configuracion.app?.colorPrimario) {
        configUpdates.push("color_primario = @colorPrimario");
        configRequest.input(
          "colorPrimario",
          sql.NVarChar,
          empresa.configuracion.app.colorPrimario
        );
      }
      if (empresa.configuracion.app?.hayPrimerInicio !== undefined) {
        configUpdates.push("hay_primer_inicio = @hayPrimerInicio");
        configRequest.input(
          "hayPrimerInicio",
          sql.Bit,
          empresa.configuracion.app.hayPrimerInicio ? 1 : 0
        );
      }
      if (empresa.configuracion.app?.esTipoObra !== undefined) {
        configUpdates.push("es_tipo_obra = @esTipoObra");
        configRequest.input(
          "esTipoObra",
          sql.Bit,
          empresa.configuracion.app.esTipoObra ? 1 : 0
        );
      }

      if (configUpdates.length > 0) {
        await configRequest.input("id_empresa", sql.Int, empresa.id).query(`
              UPDATE config_empresa
              SET ${configUpdates.join(", ")}
              WHERE id_empresa = @id_empresa
            `);
      } */
  } catch (error) {
    console.error("Error actualizando la empresa:", error);
    throw error;
  }
};

const updateConfigEmpresa = async (configuracion, id_empresa) => {
  try {
    const pool = await sql.connect(config);

    // Ahora actualizamos la tabla de configuración si hay datos
    if (!configuracion) {
      return;
    }
    const configUpdates = [];
    const configRequest = pool.request();

    // Configuración email
    configUpdates.push("email_entrante = @email");
    configRequest.input("email", sql.NVarChar, configuracion.email.email);
    if (configuracion.email?.smtp_host) {
      configUpdates.push("smtp_host = @smtp_host");
      configRequest.input(
        "smtp_host",
        sql.NVarChar,
        configuracion.email.smtp_host
      );
    }
    if (configuracion.email?.smtp_port) {
      configUpdates.push("smtp_port = @smtp_port");
      configRequest.input(
        "smtp_port",
        sql.NVarChar,
        configuracion.email.smtp_port
      );
    }
    if (configuracion.email?.smtp_user) {
      configUpdates.push("smtp_user = @smtp_user");
      configRequest.input(
        "smtp_user",
        sql.NVarChar,
        configuracion.email.smtp_user
      );
    }
    if (configuracion.email?.smtp_pass) {
      configUpdates.push("smtp_pass = @smtp_pass");
      configRequest.input(
        "smtp_pass",
        sql.NVarChar,
        configuracion.email.smtp_pass
      );
    }

    // Configuración app
    if (configuracion.app?.colorPrimario) {
      configUpdates.push("color_primario = @colorPrimario");
      configRequest.input(
        "colorPrimario",
        sql.NVarChar,
        configuracion.app.colorPrimario
      );
    }
    if (configuracion.app?.hayPrimerInicio !== undefined) {
      configUpdates.push("hay_primer_inicio = @hayPrimerInicio");
      configRequest.input(
        "hayPrimerInicio",
        sql.Bit,
        configuracion.app.hayPrimerInicio ? 1 : 0
      );
    }
    if (configuracion.app?.esTipoObra !== undefined) {
      configUpdates.push("es_tipo_obra = @esTipoObra");
      configRequest.input(
        "esTipoObra",
        sql.Bit,
        configuracion.app.esTipoObra ? 1 : 0
      );
    }

    if (configUpdates.length > 0) {
      await configRequest.input("id_empresa", sql.Int, id_empresa).query(`
                UPDATE config_empresa
                SET ${configUpdates.join(", ")}
                WHERE id_empresa = @id_empresa
              `);
    }
  } catch (error) {
    console.error("Error actualizando la configuracion empresa:", error);
    throw error;
  }
};

module.exports = {
  getEmpresa,
  getColorPrincipal,
  updateEmpresa,
  updateConfigEmpresa,
};
