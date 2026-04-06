const db = require("../Model");
const { validateCIFFormat, validateCIFUnique } = require("../shared/validator");
const { configEmpresaResource } = require("../resources/empresa");

const getEmpresas = async (req, res) => {
  try {
    const empresas = await db.EMPRESA.findAll({
      include: [
        {
          model: db.CONFIG_EMPRESA,
          as: "config",
        },
      ],
      attributes: [
        "id_empresa",
        "nombre",
        "cif",
        "razon_social",
        "direccion",
        "telefono",
      ],
    });

    res.json(
      empresas.map((e) => ({
        id: e.id_empresa,
        nombre: e.nombre,
        cif: e.cif,
        razonSocial: e.razon_social,
        direccion: e.direccion,
        telefono: e.telefono,
        configuracion: e.config
          ? {
              app: {
                hayPrimerInicio: e.config.hay_primer_inicio,
                colorPrimario: e.config.color_primario,
                esTipoObra: e.config.es_tipo_obra,
                isLaTorre: e.config.isLaTorre,
                parteAuto: e.config.parte_auto,
                proyectosAutorizacion: e.config.proyectos_autorizacion,
              },
              email: {
                email: e.config.email_entrante,
                smtp_host: e.config.smtp_host,
                smtp_port: e.config.smtp_port,
                smtp_user: e.config.smtp_user,
                smtp_pass: e.config.smtp_pass,
              },
              limiteUsuarios: e.config.limite_usuarios,
            }
          : null,
      })),
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

    res.status(200).json({
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
          parteAuto: config?.parte_auto,
          proyectosAutorizacion: config?.proyectos_autorizacion,
          timezone: config?.timezone, //devMike: para la zona horaria de la empresa
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

const createEmpresaCompleta = async (req, res) => {
  const {
    nombre,
    cif,
    razonSocial,
    direccion,
    telefono,
    configuracion,
    modulos,
    usuarioAdmin,
  } = req.body;
  const t = await db.sequelize.transaction();

  try {
    // Validaciones
    if (!nombre || !cif) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Nombre y CIF son obligatorios." });
    }

    if (!(await validateCIFUnique(cif, 0))) {
      await t.rollback();
      return res.status(400).json({ message: "Este CIF esta en uso." });
    }

    if (!validateCIFFormat(cif)) {
      await t.rollback();
      return res.status(400).json({ message: "El CIF no es válido." });
    }

    if (usuarioAdmin) {
      if (!usuarioAdmin.username || !usuarioAdmin.password) {
        console.log(req.body);
        await t.rollback();
        return res.status(400).json({
          message:
            "Usuario y contraseña son obligatorios para el administrador.",
        });
      }
      const existingUser = await db.USUARIOS.findOne({
        where: { user_name: usuarioAdmin.username },
      });
      if (existingUser) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "El nombre de usuario ya está en uso." });
      }
    }

    // 1) Crear empresa base
    const nuevaEmpresa = await db.EMPRESA.create(
      {
        nombre,
        cif,
        razon_social: razonSocial ?? null,
        direccion: direccion ?? null,
        telefono: telefono ?? null,
      },
      { transaction: t },
    );

    // Obtener id generado
    const id_empresa = nuevaEmpresa.id_empresa;

    // 2) Crear configuración inicial
    if (configuracion) {
      await db.CONFIG_EMPRESA.create(
        {
          id_empresa,
          email_entrante: configuracion?.email?.email ?? null,
          smtp_host: configuracion?.email?.smtp_host ?? null,
          smtp_user: configuracion?.email?.smtp_user ?? null,
          smtp_port: configuracion?.email?.smtp_port ?? null,
          smtp_pass: configuracion?.email?.smtp_pass ?? null,
          color_primario: configuracion?.app?.colorPrimario ?? "#2c3e50",
          hay_primer_inicio: configuracion?.app?.hayPrimerInicio ?? false,
          es_tipo_obra: configuracion?.app?.esTipoObra ?? false,
          isLaTorre: configuracion?.app?.isLaTorre ?? false,
          parte_auto: configuracion?.app?.parteAuto ?? false,
          proyectos_autorizacion:
            configuracion?.app?.proyectosAutorizacion ?? false,
          limite_usuarios: configuracion?.limiteUsuarios ?? null,
        },
        { transaction: t },
      );
    }

    // 3) Crear módulos y submódulos
    if (modulos && Array.isArray(modulos)) {
      for (const modulo of modulos) {
        await db.EMPRESAS_MODULOS.create(
          {
            id_empresa,
            id_modulo: modulo.id,
            habilitado: modulo.habilitado ?? false,
          },
          { transaction: t },
        );

        if (modulo.submodulos && Array.isArray(modulo.submodulos)) {
          for (const sub of modulo.submodulos) {
            await db.EMPRESAS_SUBMODULOS.create(
              {
                id_empresa,
                id_submodulo: sub.id,
                habilitado: sub.habilitado ?? false,
              },
              { transaction: t },
            );
          }
        }
      }
    }

    // 4) Crear usuario admin
    if (usuarioAdmin) {
      await db.USUARIOS.create(
        {
          user_name: usuarioAdmin.username,
          contrasena: usuarioAdmin.password,
          id_empresa,
          rol: "admin",
          fichaje_activo: true,
          primer_inicio: false,
        },
        { transaction: t },
      );
    }

    // 5) Confirmar transacción
    await t.commit();
    res.status(201).json({
      success: true,
      message: "Empresa creada correctamente",
      id_empresa,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error al crear empresa:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

const getConfigEmpresa = async (req, res) => {
  try {
    const { empresa } = req.user;

    const config = await db.CONFIG_EMPRESA.findOne({
      where: { id_empresa: empresa },
      attributes: [
        "es_tipo_obra",
        "email_entrante",
        "smtp_user",
        "color_principal",
        "isLaTorre",
        "parte_auto",
        "proyectos_autorizacion",
      ],
      include: [
        {
          model: db.EMPRESA,
          as: "empresa",
          attributes: ["telefono"],
          required: true,
          where: { id_empresa: empresa },
        },
      ],
    });

    if (!config) {
      return res.status(404).send("Configuración no encontrada");
    }

    const response = configEmpresaResource(config);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener configuración y teléfono:", error);
    res.status(500).send("Error del servidor");
  }
};

const updateEmpresa = async (req, res) => {
  try {
    const empresa = req.body;

    if (!validateCIFFormat(empresa.cif)) {
      return res.status(400).json({ message: "El CIF no es válido." });
    }

    const empresaExistente = await db.EMPRESA.findOne({
      where: {
        cif: empresa.cif,
        id_empresa: { [db.Sequelize.Op.ne]: empresa.id },
      },
    });

    if (empresaExistente) {
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
      },
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

    await db.CONFIG_EMPRESA.update(
      {
        email_entrante: empresa.configuracion.email.email,
        smtp_host: empresa.configuracion.email.smtp_host,
        smtp_user: empresa.configuracion.email.smtp_user,
        smtp_port: empresa.configuracion.email.smtp_port,
        smtp_pass: empresa.configuracion.email.smtp_pass,
        color_principal: empresa.configuracion.app.colorPrimario,
        hay_primer_inicio: empresa.configuracion.app.hayPrimerInicio,
        es_tipo_obra: empresa.configuracion.app.esTipoObra,
        isLaTorre: empresa.configuracion.app.isLaTorre,
        parte_auto: empresa.configuracion.app.parteAuto,
        proyectos_autorizacion: empresa.configuracion.app.proyectosAutorizacion,
        timezone: empresa.configuracion.app.timezone //devMike: esto es para que la hora de fichar sea la de la empresa en su huso horario
      },
      {
        where: { id_empresa: req.user.empresa },
      },
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).send("Error del servidor");
  }
};

const updateEmpresaCompleta = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const empresa = req.body || {};
    const app = empresa.app || {};
    const email = empresa.email || {};

    const updateData = {};

    // Email config
    if (email.email !== undefined) updateData.email_entrante = email.email;
    if (email.smtp_host !== undefined) updateData.smtp_host = email.smtp_host;
    if (email.smtp_user !== undefined) updateData.smtp_user = email.smtp_user;
    if (email.smtp_port !== undefined) updateData.smtp_port = email.smtp_port;
    if (email.smtp_pass !== undefined) updateData.smtp_pass = email.smtp_pass;

    // App config
    if (app.colorPrimario !== undefined)
      updateData.color_primario = app.colorPrimario;
    if (app.hayPrimerInicio !== undefined)
      updateData.hay_primer_inicio = app.hayPrimerInicio;
    if (app.esTipoObra !== undefined) updateData.es_tipo_obra = app.esTipoObra;
    if (app.isLaTorre !== undefined) updateData.isLaTorre = app.isLaTorre;
    if (app.parteAuto !== undefined) updateData.parte_auto = app.parteAuto;
    if (app.proyectosAutorizacion !== undefined)
      updateData.proyectos_autorizacion = app.proyectosAutorizacion;
    if (app.timezone !== undefined) updateData.timezone = app.timezone; //devMike: identico a antes, si no se configura por defecto 
    // Limite usuarios
    if (empresa.limiteUsuarios !== undefined) {
      updateData.limite_usuarios = empresa.limiteUsuarios;
    }

    if (Object.keys(updateData).length > 0) {
      await db.CONFIG_EMPRESA.update(updateData, {
        where: { id_empresa: empresa.id_empresa },
        transaction: t,
      });
    }

    await t.commit();
    res.status(200).json({ success: true });
  } catch (error) {
    await t.rollback();
    console.error("Error al actualizar empresa:", error);
    res.status(500).send("Error del servidor");
  }
};

const getCountUsersByEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const users = await db.USUARIOS.findAll({
      where: { id_empresa: id, rol: { [db.Sequelize.Op.ne]: "superadmin" } },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error al contar usuarios por empresa:", error);
    res.status(500).send("Error del servidor");
  }
};

//dev-mike
const updateColorPrincipal = async (req, res) => {
    try {
      const { empresa } = req.user;
      const { color_principal } = req.body;

      if (!color_principal || !/^#[0-9A-Fa-f]{6}$/.test(color_principal)) {
        return res.status(400).json({ message: "Color inválido. Formato esperado: #RRGGBB" });
      }

      await db.CONFIG_EMPRESA.update(
        { color_principal },
        { where: { id_empresa: empresa } }
      );

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error al actualizar color principal:", error);
      res.status(500).send("Error del servidor");
    }
  };
module.exports = {
  getEmpresas,
  getEmpresa,
  updateEmpresa,
  updateConfigEmpresa,
  getConfigEmpresa,
  getCountUsersByEmpresa,
  updateEmpresaCompleta,
  createEmpresaCompleta,
  updateColorPrincipal,
};
