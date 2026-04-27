const db = require("../Model");
const { invalidateCache } = require("../middleware/moduleMiddleware");

const obtenerModulos = async (req, res) => {
  const { id_empresa } = req.query;
  try {
    const modulos = await db.MODULOS.findAll({
      include: [
        {
          model: db.SUBMODULOS,
          as: "modulo_submodulos",
          include: [
            {
              model: db.EMPRESA,
              as: "submodulo_empresas",
              where: { id_empresa },
              required: false,
              through: {
                attributes: ["habilitado"],
              },
            },
          ],
        },
        {
          model: db.EMPRESA,
          as: "modulo_empresas",
          where: { id_empresa },
          required: false,
          through: {
            attributes: ["habilitado"],
          },
        },
      ],
    });

    const formattedModulos = modulos.map((modulo) => {
      const moduloData = modulo.dataValues;

      return {
        id: moduloData.id,
        nombre: moduloData.nombre,
        clave_modulo: moduloData.clave_modulo,
        habilitado:
          moduloData.modulo_empresas?.[0]?.EMPRESAS_MODULOS?.habilitado ||
          false,
        submodulos: moduloData.modulo_submodulos.map((submodulo) => {
          const submoduloData = submodulo.dataValues;

          const empresaSubmodulo =
            submoduloData.submodulo_empresas?.[0]?.dataValues;
          return {
            id: submoduloData.id,
            nombre: submoduloData.nombre,
            clave: submoduloData.clave,
            habilitado:
              empresaSubmodulo?.EMPRESAS_SUBMODULOS?.habilitado || false,
          };
        }),
      };
    });

    return res.status(200).json(formattedModulos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error interno al obtener modulos" });
  }
};

const createModulo = async (req, res) => {
  try {
    const { nombre, clave_modulo } = req.body;

    if (!nombre || !clave_modulo) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    await db.MODULOS.create({ nombre, clave_modulo });
    return res.status(201).json({ message: "Módulo creado correctamente" });
  } catch (error) {
    console.error("Error al crear el módulo:", error.message);
    res.status(500).json({ message: "Error interno al crear el módulo" });
  }
};

const createSubmodulo = async (req, res) => {
  try {
    const { id_modulo, nombre, clave } = req.body;

    if (!id_modulo || !nombre || !clave) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    await db.SUBMODULOS.create({ id_modulo, nombre, clave });
    return res.status(201).json({ message: "Submódulo creado correctamente" });
  } catch (error) {
    console.error("Error al crear el submódulo:", error.message);
    res.status(500).json({ message: "Error interno al crear el submódulo" });
  }
};

const actualizarModulosEmpresa = async (req, res) => {
  const { id_empresa, modulos } = req.body;

  if (!id_empresa || !Array.isArray(modulos)) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  let t;
  try {
    t = await db.sequelize.transaction();

    for (const modulo of modulos) {
      const existingModulo = await db.EMPRESAS_MODULOS.findOne({
        where: { id_empresa, id_modulo: modulo.id },
        transaction: t,
      });

      if (existingModulo) {
        await existingModulo.update({ habilitado: modulo.habilitado }, { transaction: t });
      } else {
        await db.EMPRESAS_MODULOS.create(
          { id_empresa, id_modulo: modulo.id, habilitado: modulo.habilitado },
          { transaction: t }
        );
      }

      for (const sub of (modulo.submodulos || [])) {
        const existingSub = await db.EMPRESAS_SUBMODULOS.findOne({
          where: { id_empresa, id_submodulo: sub.id },
          transaction: t,
        });

        if (existingSub) {
          await existingSub.update({ habilitado: sub.habilitado }, { transaction: t });
        } else {
          await db.EMPRESAS_SUBMODULOS.create(
            { id_empresa, id_submodulo: sub.id, habilitado: sub.habilitado },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();
    invalidateCache(id_empresa); //evitamos esperar al TTL para hacer refresh de los permisos
    res.status(200).json({ message: "Modulos actualizados" });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Error al actualizar modulos:", error);
    res.status(500).json({ message: "Error al actualizar modulos" });
  }
};

module.exports = {
  getModulos: obtenerModulos,
  createModulo,
  createSubmodulo,
  updateModulosEmpresa: actualizarModulosEmpresa,
};
