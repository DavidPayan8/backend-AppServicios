/* const {
  getEmpresa,
  getEmpresas,
  getColorPrincipal,
  updateEmpresa,
  updateConfigEmpresa,
} = require("../models/empresaModel"); */
const db = require("../Model");
const { validateCIFFormat, validateCIFUnique } = require("../shared/validator");

const getEmpresas = async (req, res) => {
  try {
    const empresas = await db.EMPRESA.findAll({
      attributes: ["id_empresa", "nombre", "cif", "razon_social"],
    });

    res.json(
      empresas.map((e) => ({
        id: e.id_empresa,
        nombre: e.nombre,
        cif: e.cif,
        razon_social: e.razon_social,
      }))
    );
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    res.status(500).send("Error del servidor");
  }
};

const getEmpresa = async (req, res) => {
  try {
    const { id } = req.query;

    const empresa = await db.EMPRESA.findByPk(id, {
      include: {
        model: db.CONFIG_EMPRESA,
        as: "config",
      },
    });

    if (!empresa) return res.status(404).send("Empresa no encontrada");

    const config = empresa.config;

    res.json({
      id: empresa.id_empresa,
      nombre: empresa.nombre,
      razonSocial: empresa.razon_social,
      telefono: empresa.telefono,
      direccion: empresa.direccion,
      cif: empresa.cif,
      configuracion: {
        app: {
          hayPrimerInicio: config?.hay_primer_inicio,
          colorPrimario: config?.color_primario,
          esTipoObra: config?.es_tipo_obra,
        },
        email: {
          email: config?.email_entrante,
          smtp_host: config?.smtp_host,
          smtp_user: config?.smtp_user,
          smtp_port: config?.smtp_port,
          smtp_pass: config?.smtp_pass,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    res.status(500).send("Error del servidor");
  }
};

const getColorPrincipal = async (req, res) => {
  try {
    const empresaId = req.user.empresa;

    const config = await db.CONFIG_EMPRESA.findOne({
      where: { id_empresa: empresaId },
      attributes: ["color_primario"],
    });

    res.json(config?.color_primario || "#0d5c91");
  } catch (error) {
    console.error("Error al obtener color:", error);
    res.status(500).send("Error del servidor");
  }
};

const updateEmpresa = async (req, res) => {
  try {
    const empresa = req.body;

    if (!validateCIFFormat(empresa.cif)) {
      return res.status(400).json({ message: "El CIF no es válido." });
    }

    const isUnique = await validateCIFUnique(empresa.cif, empresa.id);
    if (!isUnique) {
      return res
        .status(400)
        .json({ message: "Ya existe una empresa con este CIF." });
    }

    await db.EMPRESA.update(
      {
        nombre: empresa.nombre,
        cif: empresa.cif,
        razon_social: empresa.razonSocial,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
      },
      {
        where: { id_empresa: empresa.id },
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    res.status(500).send("Error del servidor");
  }
};

const updateConfigEmpresa = async (req, res) => {
  try {
    const empresa = req.body;

    if (!validateCIFFormat(empresa.cif)) {
      return res.status(400).json({ message: "El CIF no es válido." });
    }

    const isUnique = await validateCIFUnique(empresa.cif, empresa.id);
    if (!isUnique) {
      return res
        .status(400)
        .json({ message: "Ya existe una empresa con este CIF." });
    }

    await db.CONFIG_EMPRESA.update(
      {
        email_entrante: empresa.configuracion.email.email,
        smtp_host: empresa.configuracion.email.smtp_host,
        smtp_user: empresa.configuracion.email.smtp_user,
        smtp_port: empresa.configuracion.email.smtp_port,
        smtp_pass: empresa.configuracion.email.smtp_pass,
        color_primario: empresa.configuracion.app.colorPrimario,
        hay_primer_inicio: empresa.configuracion.app.hayPrimerInicio,
        es_tipo_obra: empresa.configuracion.app.esTipoObra,
      },
      {
        where: { id_empresa: empresa.id },
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  getEmpresas,
  getEmpresa,
  getColorPrincipal,
  updateEmpresa,
  updateConfigEmpresa,
};
