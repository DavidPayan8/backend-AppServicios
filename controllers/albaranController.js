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
    const { cabecera_id } = req.body;

    const result = await db.CABECERA.update(
      { actualizar: true },
      { where: { id: cabecera_id } }
    );

    console.log("Actualziada", result)

    res.status(200).json({ message: "Estado cabecera actualizado" });
  } catch (error) {
    console.error("Error al cambiar estado cabecera:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};

const obtenerCabeceraOt = async (req, res) => {
  try {
    const { id_ot } = req.query;

    const cabecera = await db.CABECERA.findOne({
      where: { orden_trabajo_id: id_ot },
      attributes: {
        exclude: ["orden_trabajo_Id"],
      },
      include: [
        {
          model: db.COBROS_DOC,
          as: "cobros",
        },
      ],
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
      return res.status(400).json({ message: "El parámetro 'id_cabecera' es obligatorio" });
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
    res.status(500).json({ message: "Error del servidor" });
  }
};

const cambiarDetalleAlbaran = async (req, res) => {
  try {
    const { detallesDoc } = req.body;

    const updates = await db.DETALLES_DOC.update(detallesDoc, {
      where: { id: detallesDoc.id || detallesDoc.id.id },
    });

    res.status(201).json(updates);
  } catch (error) {
    console.error("Error al cambiar detalles doc:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};

const crearDetalleAlbaran = async (req, res) => {
  try {
    const details = req.body;

    const nuevoDetalle = await db.DETALLES_DOC.create(details);

    res.status(201).json(nuevoDetalle);
  } catch (error) {
    console.error("Error al crear detalles doc:", error.message);
    res.status(500).json({ message: "Error del servidor" });
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
    res.status(500).json({ message: "Error del servidor" });
  }
};

const createCobro = async (req, res) => {
  try {
    const { cabecera_id, importe, tipo_cobro } = req.body;

    if (!cabecera_id || !importe) {
      return res
        .status(400)
        .json({ error: "cabecera_id e importe son obligatorios." });
    }

    if (typeof importe !== "number" || importe <= 0) {
      return res
        .status(400)
        .json({ error: "El importe no puede ser menor a 0." });
    }

    const nuevoCobro = await db.COBROS_DOC.create({
      cabecera_id,
      importe,
      tipo_cobro: tipo_cobro || "efectivo",
    });

    return res.status(201).json(nuevoCobro);
  } catch (error) {
    console.error("Error al crear cobro:", error);
    return res
      .status(500)
      .json({ error: "Error interno al registrar el cobro." });
  }
};

const borrarCobro = async (req, res) => {
  try {
    const { id_cobro } = req.body;

    const resultado = await db.COBROS_DOC.destroy({
      where: { id: id_cobro },
    });

    res.status(201).json({ eliminado: resultado > 0 });
  } catch (error) {
    console.error("Error al borrar cobro:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};

module.exports = {
  cambiarDetalleAlbaran,
  crearDetalleAlbaran,
  borrarDetalleAlbaran,
  createCobro,
  borrarCobro,
  obtenerCabeceraOt,
  obtenerDetallesDoc,
  crearCabeceraAlbaran,
  setEstadoCabecera,
  createCobro,
};
