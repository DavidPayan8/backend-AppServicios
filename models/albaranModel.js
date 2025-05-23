const sql = require("mssql");
const config = require("../config/dbConfig");

const cambiarDetallesDoc = async (details) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, details.id)
      .input("cabecera_id", sql.Int, details.cabecera_Id)
      .input("articulo_id", sql.Int, details.articulo_Id)
      .input("descripcion_articulo", sql.VarChar, details.descripcion_articulo)
      .input("descripcion_larga", sql.VarChar, details.descripcion_larga)
      .input("cantidad", sql.Int, details.cantidad)
      .input("precio", sql.Float, details.precio)
      .input("descuento", sql.Int, details.descuento)
      .input("importe_neto", sql.Float, details.importe_neto)
      .input("iva_porcentaje", sql.Int, details.iva_porcentaje)
      .input("cuota_iva", sql.Float, details.cuota_iva)
      .input("total_linea", sql.Float, details.total_linea).query(`
          UPDATE DETALLES_DOC 
          SET cabecera_id = @cabecera_id,
              articulo_id = @articulo_id,
              descripcion_articulo = @descripcion_articulo,
              descripcion_larga = @descripcion_larga, 
              cantidad = @cantidad, 
              precio = @precio,
              descuento = @descuento,
              importe_neto = @importe_neto,
              iva_porcentaje = @iva_porcentaje,
              cuota_iva = @cuota_iva,
              total_linea = @total_linea
          WHERE id = @id 
        `);
        await updateCabecera(details.id);

  } catch (error) {
    console.error("Error al actualizar el detalles doc:", details);
    throw error;
  }
};

const crearDetallesDoc = async (details) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("cabecera_id", sql.Int, details.cabecera_Id)
      .input("articulo_id", sql.Int, details.articulo_Id)
      .input("descripcion_articulo", sql.VarChar, details.descripcion_articulo)
      .input("descripcion_larga", sql.VarChar, details.descripcion_larga)
      .input("cantidad", sql.Int, details.cantidad)
      .input("precio", sql.Float, details.precio)
      .input("descuento", sql.Int, details.descuento)
      .input("importe_neto", sql.Float, details.importe_neto)
      .input("iva_porcentaje", sql.Int, details.iva_porcentaje)
      .input("cuota_iva", sql.Float, details.cuota_iva)
      .input("total_linea", sql.Float, details.total_linea).query(`
            INSERT INTO DETALLES_DOC (
                cabecera_id, 
                articulo_id, 
                descripcion_articulo, 
                descripcion_larga, 
                cantidad, 
                precio, 
                descuento, 
                importe_neto, 
                iva_porcentaje, 
                cuota_iva, 
                total_linea
            ) 
            OUTPUT INSERTED.id
            VALUES (
                @cabecera_id, 
                @articulo_id, 
                @descripcion_articulo, 
                @descripcion_larga, 
                @cantidad, 
                @precio, 
                @descuento, 
                @importe_neto, 
                @iva_porcentaje, 
                @cuota_iva, 
                @total_linea
            )
        `);

        await updateCabecera(result.recordset[0].id);

    return result.recordset[0].id;
  } catch (error) {
    console.error("Error al crear detalles doc:", details);
    throw error;
  }
};

const obtenerDetallesDocDb = async (id) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT 
            dd.*, 
            a.referencia AS referencia
        FROM 
            DETALLES_DOC dd
        LEFT JOIN 
            ARTICULOS a
        ON 
            dd.articulo_Id = a.id
        WHERE 
            dd.cabecera_Id = @id
    `);
    return result.recordset;
  } catch (error) {
    console.error("Error obteniendo detalles doc data: ", error);
    throw error;
  }
};

const updateCabecera = async (id) => {
  try {
    // Obtener el cabecera_id a partir del id de detalles_doc
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT cabecera_id FROM detalles_doc WHERE id = @id");

    if (result.recordset.length > 0) {
      const cabeceraId = result.recordset[0].cabecera_id;

      // Actualizar la tabla CABECERA
      await pool
        .request()
        .input("cabeceraId", sql.Int, cabeceraId)
        .query("UPDATE CABECERA SET actualizar = 1 WHERE id = @cabeceraId");
    }
  } catch (error) {
    console.error('Error al actualizar la cabecera:', error);
  }
};

const borrarDetalleDoc = async (id) => {
  try {
    const pool = await sql.connect(config);
    //Borrar el detalles_doc
    await pool.request().input("id", sql.Int, id).query(`
                DELETE FROM DETALLES_DOC
                WHERE id = @id
            `);

   await updateCabecera(id);
  } catch (error) {
    console.error("Error al eliminar el detalle Doc:", error);
  }
};

const crearCabeceraDoc = async (cabecera, empresa) => {
  try {
    const pool = await sql.connect(config);

    // Obtener el último número y sumarle 1
    const lastNumber = await pool.request().input("empresaId", empresa).query(`

      SELECT COALESCE(MAX(numero), 0) + 1 AS nuevoNumero 
      FROM CABECERA WHERE id_empresa = @empresaId
    `);
    const result = await pool
      .request()
      .input("fecha", sql.Date, cabecera.fecha)
      .input("numero", sql.Int, lastNumber.recordset[0].nuevoNumero)
      .input("entidad_id", sql.Int, cabecera.entidad_id)
      .input("base", sql.Float, cabecera.base)
      .input("tipo_IVA", sql.Int, cabecera.tipo_iva)
      .input("id_empresa", sql.Int, empresa)
      .input("id_Servicio_origen", sql.Int, cabecera.id_servicio_origen)
      .input("orden_trabajo_id", sql.Int, cabecera.orden_trabajo_id).query(`
        INSERT INTO CABECERA
          (fecha, numero, entidad_id, base, tipo_IVA, id_empresa ,id_Servicio_origen, orden_trabajo_id)
        OUTPUT 
          INSERTED.*
        VALUES 
          (@fecha, @numero, @entidad_id, @base, @tipo_IVA, @id_empresa ,@id_Servicio_origen, @orden_trabajo_id)
      `);
    return result.recordset[0];
  } catch (error) {
    console.error("Error al actualizar el crear doc:", error);
    throw error;
  }
};

const setEstadoCabeceraDB = async (cabecera_id) => {
  try {
    const pool = await sql.connect(config);
    await pool.request().input("cabecera_id", sql.Int, cabecera_id).query(`
      UPDATE CABECERA 
        SET actualizar = 1
        WHERE id = @cabecera_id
    `);
  } catch (error) {
    console.error("Error al actualizar el cabecera:", error.message);
    throw error;
  }
};

const obtenerCabeceraDoc = async (id, empresa) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("id_empresa", sql.Int, empresa).query(`
          SELECT * 
          FROM CABECERA
          WHERE orden_trabajo_id = @id
        `);
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener el cabecera doc", error.message);
    throw error;
  }
};


const cambiarCabeceraDoc = async (cabecera, empresa) => {

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("fecha", sql.Date, cabecera.fecha)
      .input("numero", sql.Int, cabecera.numero)
      .input("entidad_id", sql.Int, cabecera.entidad_id)
      .input("base", sql.Float, cabecera.base)
      .input("tipo_IVA", sql.Int, cabecera.tipo_IVA)
      .input("orden_trabajo_id", sql.Int, cabecera.orden_trabajo_id).query(`
        UPDATE CABECERA 
          SET fecha = @fecha,
              numero = @numero,
              entidad_id = @entidad_id,
              base = @base, 
              tipo_IVA = @tipo_IVA, 
              tarifa_id = @tarifa_id,
              actualizar = 1
          WHERE orden_trabajo_id = @orden_trabajo_id AND id_empresa = @id_empresa
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Error al actualizar el cabecera:", details);
    throw error;
  }
};

module.exports = {
  cambiarDetallesDoc,
  crearDetallesDoc,
  borrarDetalleDoc,
  crearCabeceraDoc,
  obtenerCabeceraDoc,
  cambiarCabeceraDoc,
  obtenerDetallesDocDb,
  setEstadoCabeceraDB,
};
