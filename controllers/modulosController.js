const db = require("../Model");

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

  try {
    const t = await db.sequelize.transaction();
    for (const modulo of modulos) {
      await db.EMPRESAS_MODULOS.upsert(
        {
          id_empresa,
          id_modulo: modulo.id,
          habilitado: modulo.habilitado,
        },
        {
          where: {
            id_empresa,
            id_modulo: modulo.id,
          },
          transaction: t,
        }
      );

      for (const sub of modulo.submodulos) {
        await db.EMPRESAS_SUBMODULOS.upsert(
          {
            id_empresa,
            id_submodulo: sub.id,
            habilitado: sub.habilitado,
          },
          {
            where: {
              id_empresa,
              id_submodulo: sub.id,
            },
            transaction: t,
          }
        );
      }
    }

    await t.commit();
    res.status(200).json({ message: "Modulos actualizados" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Erro al actualizar modulos" });
    console.log(error);
  }
};

module.exports = {
  getModulos: obtenerModulos,
  createModulo,
  createSubmodulo,
  updateModulosEmpresa: actualizarModulosEmpresa,
};
