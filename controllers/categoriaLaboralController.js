const db = require("../Model");
const { categoriaLaboralCollection } = require("../resources/categoriaLaboral");
const {
  mapTarifasCategorias,
  resourceTarifaCategoria,
} = require("../resources/tarifaCategoria");
const {
  haySolapamiento,
  obtenerTarifasExistentes,
} = require("../utils/tarifas");

/*** Categorías Laborales ***/
const getCategorias = async (req, res) => {
  try {
    const categorias = await db.CATEGORIA_LABORAL.findAll({
      where: { id_empresa: req.user.empresa },
      include: [
        {
          model: db.TARIFAS_CATEGORIAS,
          as: "tarifas",
          attributes: ["horas_jornada", "salario_base"],
        },
      ],
    });

    res.status(200).json(categoriaLaboralCollection(categorias));
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: error.message });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { nombre, codigo_rol } = req.body;
    const categoria = await db.CATEGORIA_LABORAL.create({
      nombre,
      codigo_rol,
      id_empresa: req.user.empresa,
    });
    res.status(201).json(categoria);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo_rol } = req.body;

    const categoria = await db.CATEGORIA_LABORAL.findByPk(id);
    if (!categoria)
      return res.status(404).json({ message: "Categoría no encontrada" });

    await categoria.update({ nombre, codigo_rol });
    res.status(200).json(categoria);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteCategoria = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    await db.TARIFAS_CATEGORIAS.destroy({
      where: { id_grupo: id },
      transaction: t,
    });

    const deleted = await db.CATEGORIA_LABORAL.destroy({
      where: { id },
      transaction: t,
    });
    if (!deleted) {
      await t.rollback();
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    await t.commit();
    res
      .status(200)
      .json({ message: "Categoría y tarifas eliminadas con éxito" });
  } catch (error) {
    await t.rollback();
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ message: error.message });
  }
};

/*** Tarifas Categorías ***/
const getTarifas = async (req, res) => {
  try {
    const tarifas = await db.TARIFAS_CATEGORIAS.findAll({
      include: [{ model: db.CATEGORIA_LABORAL, as: "categoriaLaboral" }],
      where: { id_empresa: req.user.empresa },
    });

    const result = mapTarifasCategorias(tarifas);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener tarifas:", error);
    res.status(500).json({ message: error.message });
  }
};

const createTarifa = async (req, res) => {
  try {
    const { id_grupo, horas_jornada, salario_base, fecha_inicio, fecha_fin } =
      req.body;

    const existentes = await obtenerTarifasExistentes(
      db,
      id_grupo,
      req.user.empresa,
    );
    const solapada = haySolapamiento(
      existentes,
      new Date(fecha_inicio),
      fecha_fin ? new Date(fecha_fin) : null,
    );

    if (solapada) {
      return res.status(400).json({
        message:
          "Ya existe una tarifa activa o solapada para esta categoría laboral.",
      });
    }

    const tarifa = await db.TARIFAS_CATEGORIAS.create({
      id_grupo,
      horas_jornada,
      salario_base,
      fecha_inicio,
      fecha_fin: fecha_fin || null,
      id_empresa: req.user.empresa,
    });

    const result = resourceTarifaCategoria(tarifa);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error al crear tarifa:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateTarifa = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_grupo, horas_jornada, salario_base, fecha_inicio, fecha_fin } =
      req.body;

    const tarifa = await db.TARIFAS_CATEGORIAS.findByPk(id);
    if (!tarifa)
      return res.status(404).json({ message: "Tarifa no encontrada" });

    const existentes = await obtenerTarifasExistentes(
      db,
      id_grupo,
      req.user.empresa,
      id,
    );
    const solapada = haySolapamiento(
      existentes,
      new Date(fecha_inicio),
      fecha_fin ? new Date(fecha_fin) : null,
    );

    if (solapada) {
      return res.status(400).json({
        message:
          "Ya existe una tarifa activa o solapada para esta categoría laboral.",
      });
    }

    await tarifa.update({
      id_grupo,
      horas_jornada,
      salario_base,
      fecha_inicio,
      fecha_fin: fecha_fin || null,
    });

    res
      .status(200)
      .json({ message: "Tarifa actualizada correctamente", tarifa });
  } catch (error) {
    console.error("Error al actualizar tarifa:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteTarifa = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.TARIFAS_CATEGORIAS.destroy({
      where: { id_tarifa: id },
    });
    if (!deleted)
      return res.status(404).json({ message: "Tarifa no encontrada" });

    res.status(200).json({ message: "Tarifa eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar tarifa:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getTarifas,
  createTarifa,
  updateTarifa,
  deleteTarifa,
};
