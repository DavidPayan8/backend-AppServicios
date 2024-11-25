const sql = require("mssql");
const config = require("../config/dbConfig");

const cambiarDetallesDoc = async (id, details) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("cabecera_id", sql.Int, details.cabecera_id)
      .input("articulo_id", sql.Int, details.articulo.Id)
      .input("descripcion_articulo", sql.VarChar, details.descripcion_articulo)
      .input("descripcion_larga", sql.VarChar, details.descripcion_larga)
      .input("cantidad", sql.Int, details.cantidad)
      .input("tarifa_id", sql.Int, details.tarifa_id)
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
              tarifa_id = @tarifa_id
              precio = @precio
              descuento = @descuento
              importe_neto = @importe_neto
              iva_porcentaje = @iva_porcentaje
              cuota_iva = @cuota_iva
              total_linea = @total_linea
          WHERE cabecera_id = @id
        `);

    console.log("Parte de trabajo actualizado en la base de datos:", result);
  } catch (error) {
    console.error("Error al actualizar el detalles doc:", details);
    throw error;
  }
};

const crearDetallesDoc = async (id, details) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("cabecera_id", sql.Int, details.cabecera_id)
      .input("articulo_id", sql.Int, details.articulo.Id)
      .input("descripcion_articulo", sql.VarChar, details.descripcion_articulo)
      .input("descripcion_larga", sql.VarChar, details.descripcion_larga)
      .input("cantidad", sql.Int, details.cantidad)
      .input("tarifa_id", sql.Int, details.tarifa_id)
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
                tarifa_id, 
                precio, 
                descuento, 
                importe_neto, 
                iva_porcentaje, 
                cuota_iva, 
                total_linea
            ) VALUES (
                @cabecera_id, 
                @articulo_id, 
                @descripcion_articulo, 
                @descripcion_larga, 
                @cantidad, 
                @tarifa_id, 
                @precio, 
                @descuento, 
                @importe_neto, 
                @iva_porcentaje, 
                @cuota_iva, 
                @total_linea
            )
        `);

    console.log("Parte de trabajo actualizado en la base de datos:", result);
  } catch (error) {
    console.error("Error al actualizar el detalles doc:", details);
    throw error;
  }
};

const borrarDetalleDoc = async (id) => {
  try {
    const pool = await sql.connect(config);
    await pool.request().input("id", sql.Int, id).query(`
                DELETE FROM DETALLES_DOC
                WHERE id = @id
            `);
  } catch (error) {
    console.error("Error al eliminar el registro:", error);
  }
};

const crearCabeceraDoc = async (cabecera) => {
  try {
    console.log(cabecera)
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("fecha", sql.Date, cabecera.fecha)
      .input("numero", sql.Int, cabecera.numero)
      .input("entidad_id", sql.Int, cabecera.entidad_id)
      .input("base", sql.Float, cabecera.base)
      .input("tipo_IVA", sql.Int, cabecera.tipo_iva)
      .input("orden_trabajo_id", sql.Int, cabecera.orden_trabajo_id).query(`
        INSERT INTO CABECERA
          (fecha, numero, entidad_id, base, tipo_IVA, orden_trabajo_id)
        OUTPUT 
          INSERTED.*
        VALUES 
          (@fecha, @numero, @entidad_id, @base, @tipo_IVA, @orden_trabajo_id)
      `);

      console.log(result.recordset)
    return result.recordset[0];
  } catch (error) {
    console.error("Error al actualizar el detalles doc:", details);
    throw error;
  }
};

const obtenerCabeceraDoc = async (id) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().input("id", sql.Int, id).query(`
          SELECT * 
          FROM Cabecera
          WHERE orden_trabajo_id = @id
        `);

    return result.recordset;
  } catch (error) {
    console.error("Error al actualizar el detalles doc", error.message);
    throw error;
  }
};

const cambiarCabeceraDoc = async (cabecera) => {
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
              tarifa_id = @tarifa_id
          WHERE orden_trabajo_id = @orden_trabajo_id
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
};
