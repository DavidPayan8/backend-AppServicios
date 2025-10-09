const { Op, literal } = require("sequelize");
const db = require("../Model");
const { mapfichajeResource } = require("../resources/fichajes");

const obtenerFichajesProyecto = async (req, res) => {
  try {
    const { desde, hasta, trabajador, rol } = req.query;

    const whereAsistencia = {};
    const whereUsuario = {};

    if (desde) {
      whereAsistencia.fecha = { [Op.gte]: new Date(desde) };
    }
    if (hasta) {
      whereAsistencia.fecha = {
        ...whereAsistencia.fecha,
        [Op.lte]: new Date(hasta),
      };
    }
    if (trabajador) {
      whereUsuario.nomapes = { [Op.like]: `%${trabajador}%` };
    }
    if (rol) {
      whereUsuario.rol = { [Op.eq]: rol };
    }

    const fichajes = await db.CONTROL_ASISTENCIAS.findAll({
      where: whereAsistencia,
      include: [
        {
          model: db.USUARIOS,
          as: "usuario",
          where: whereUsuario,
          attributes: ["nomapes", "rol", "horas_personalizadas", "categoria_laboral_id"],
          include: [
            {
              model: db.CATEGORIA_LABORAL,
              as: "categoriaLaboral",
              attributes: ["id", "nombre"],
              include: [
                {
                  model: db.TARIFAS_CATEGORIAS,
                  as: "tarifas",
                  attributes: ["horas_jornada", "salario_base"]
                }
              ]
            }
          ]
        }
      ],
      attributes: [
        ["id", "Id"],
        ["fecha", "Fecha"],
        ["hora_entrada", "Entrada"],
        ["hora_salida", "Salida"],
        [literal("ROUND(DATEDIFF(MINUTE, hora_entrada, hora_salida), 2)"), "Total"],
        ["localizacion_entrada", "Ubicacion_entrada"],
        ["localizacion_salida", "Ubicacion_salida"]
      ],
      order: [["hora_entrada", "DESC"]],
      raw: true,
      nest: true
    });


    res.status(200).json(mapfichajeResource(fichajes));
  } catch (error) {
    console.log("Error al obtener fichajes por proyecto:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const eliminarFichajes = async (req, res) => {
  try {
    const { ids } = req.query;
    const idsArray = Array.isArray(ids)
      ? ids.map((id) => parseInt(id))
      : [parseInt(ids)];

    // Verificar si los IDs son válidos
    if (idsArray.some(isNaN)) {
      return res.status(400).json({ error: "IDs deben ser números" });
    }

    const result = await db.CONTROL_ASISTENCIAS.destroy({
      where: {
        id: {
          [Op.in]: idsArray,
        },
      },
    });

    if (result > 0) {
      res.status(200).json({ message: "Fichajes eliminados correctamente" });
    } else {
      res.status(404).json({ message: "Fichajes no encontrados" });
    }
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ error: "Error al eliminar los fichajes: " + error.message });
  }
};

const patchFichaje = async (req, res) => {
  try {
    const {
      id,
      fecha,
      horaEntrada,
      horaSalida,
      localizacionEntrada,
      localizacionSalida,
    } = req.query;

    // Actualizar el fichaje
    const result = await db.CONTROL_ASISTENCIAS.update(
      {
        fecha,
        horaEntrada,
        horaSalida,
        localizacionEntrada,
        localizacionSalida,
      },
      {
        where: { id },
      }
    );

    if (result[0] > 0) {
      res.status(200).json({ message: "Fichaje actualizado correctamente" });
    } else {
      res.status(404).json({ message: "Fichaje no encontrado" });
    }
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ error: "Error al actualizar el fichaje: " + error.message });
  }
};

const postFichaje = async (req, res) => {
  try {
    const {
      idUsuario,
      entrada,
      salida,
      localizacionEntrada,
      localizacionSalida,
    } = req.query;

    // Crear un nuevo fichaje
    const result = await db.CONTROL_ASISTENCIAS.create({
      id_usuario: idUsuario,
      fecha: entrada,
      hora_entrada: entrada,
      hora_salida: salida,
      localizacion_entrada: localizacionEntrada,
      localizacion_salida: localizacionSalida,
    });

    res
      .status(201)
      .json({ message: "Fichaje creado correctamente", id: result.id });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: "Controller: Error al crear el fichaje: " + error.message,
    });
  }
};

module.exports = {
  obtenerFichajesProyecto,
  eliminarFichajes,
  patchFichaje,
  postFichaje,
};
