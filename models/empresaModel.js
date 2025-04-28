const sql = require("mssql");
const config = require("../config/dbConfig");


const getColorPrincipal = async (empresaId) => {
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
        .input("id_empresa", sql.Int, empresaId)
        .query(`
          SELECT ce.color_principal
          FROM config_empresa ce
          WHERE ce.id_empresa = @id_empresa
        `);
  
      // Si se encuentra el color, lo retornamos.
      return result.recordset[0].color_primario || '#0d5c91';  // Retorna el color desde la DB o el predeterminado.
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
          }
        }
      };
    } catch (error) {
      console.error("Error al obtener empresa:", error.message);
      throw error;
    }
  };
  

module.exports = {
  getEmpresa,
  getColorPrincipal
};
