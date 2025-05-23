const db = require("../Model");

const crearCabeceraAlbaran = async (req, res) => {
  const { empresa } = req.user;
  const { cabecera } = req.body;

  try {
    // Paso 1: Obtener el último número y sumarle 1
    const ultimoNumero = await db.CABECERA.max("numero", {
      where: { id_empresa: empresa },
    });

    const nuevoNumero = (ultimoNumero || 0) + 1;

    // Paso 2: Crear la cabecera con el nuevo número
    const cabeceraCreada = await db.CABECERA.create({
      ...cabecera,
      numero: nuevoNumero,
      id_empresa: empresa,
    });

    res.status(201).json(cabeceraCreada);
  } catch (error) {
    console.error("Error al crear cabecera doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const setEstadoCabecera = async (req, res) => {
  try {
    const { cabecera_id } = req.query;

    await db.CABECERA.update(
      { actualizar: true },
      { where: { id: cabecera_id } }
    );

    res.status(200).send();
  } catch (error) {
    console.error("Error al cambiar estado cabecera:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerCabeceraOt = async (req, res) => {
  try {
    const { id_ot } = req.query;

    const cabecera = await db.CABECERA.findOne({
      where: { orden_trabajo_id: id_ot },
      raw: true,
    });

    res.status(200).json(cabecera);
  } catch (error) {
    console.error("Error al obtener cabecera doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const obtenerDetallesDoc = async (req, res) => {
  try {
    const { id_cabecera } = req.query;

    if (!id_cabecera) {
      return res.status(400).send("El parámetro 'id_cabecera' es obligatorio");
    }

    const detalles = await db.DETALLES_DOC.findAll({
      where: { cabecera_id: id_cabecera },
      attributes: [
        "id",
        "cabecera_id",
        "articulo_Id",
        "descripcion_articulo",
        "descripcion_larga",
        "cantidad",
        "precio",
        "descuento",
        "importe_neto",
        "iva_porcentaje",
        "cuota_iva",
        "total_linea",
      ],
      raw: true,
    });

    res.status(200).json(detalles);
  } catch (error) {
    console.error("Error al obtener detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const cambiarDetalleAlbaran = async (req, res) => {
  try {
    const { detallesDoc } = req.body;

    const updates = await db.DETALLES_DOC.update(detallesDoc, {
      where: { id: detallesDoc.id },
    });

    res.status(201).json(updates);
  } catch (error) {
    console.error("Error al cambiar detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const crearDetalleAlbaran = async (req, res) => {
  try {
    const details = req.body;

    const nuevoDetalle = await db.DETALLES_DOC.create(details);

    res.status(201).json(nuevoDetalle);
  } catch (error) {
    console.error("Error al crear detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const borrarDetalleAlbaran = async (req, res) => {
  try {
    const { id_detalle } = req.body;

    const resultado = await db.DETALLES_DOC.destroy({
      where: { id: id_detalle },
    });

    res.status(201).json({ eliminado: resultado > 0 });
  } catch (error) {
    console.error("Error al borrar detalles doc:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  cambiarDetalleAlbaran,
  crearDetalleAlbaran,
  borrarDetalleAlbaran,
  obtenerCabeceraOt,
  obtenerDetallesDoc,
  crearCabeceraAlbaran,
  setEstadoCabecera,
};
