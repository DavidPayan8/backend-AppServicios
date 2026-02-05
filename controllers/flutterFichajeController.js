const db = require("../Model");

/**
 * Flutter Fichaje Controller
 * Handles automatic check-in/check-out for Flutter app using codigo_usuario
 * No JWT authentication required
 */

const ficharFlutterHandler = async (req, res) => {
  const { codigo_usuario } = req.body;

  try {
    // Validate codigo_usuario is provided
    if (!codigo_usuario) {
      return res.status(400).json({
        success: false,
        message: "codigo_usuario es requerido",
      });
    }

    // Find user by codigo_usuario and validate belongs to authenticated company
    const usuario = await db.USUARIOS.findOne({
      where: {
        codigo_usuario,
        id_empresa: req.empresa.id,
      },
      attributes: ["id", "nomapes", "fichaje_activo", "id_empresa"],
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado o no pertenece a esta empresa",
      });
    }

    // Check if user has fichaje enabled
    if (usuario.fichaje_activo === false) {
      return res.status(403).json({
        success: false,
        message: "Permiso para fichar desactivado",
      });
    }

    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const fecha = today.toISOString().split("T")[0];

    const t = await db.sequelize.transaction();

    try {
      // Check for existing attendance record today
      const fichajeExistente = await db.CONTROL_ASISTENCIAS.findOne({
        where: {
          id_usuario: usuario.id,
          fecha,
        },
        order: [["id", "DESC"]], // Get most recent
        transaction: t,
      });

      let action;
      let fichaje;

      if (!fichajeExistente || fichajeExistente.hora_salida !== null) {
        // No record today OR last record is closed -> Create new entry (CHECK-IN)
        fichaje = await db.CONTROL_ASISTENCIAS.create(
          {
            id_usuario: usuario.id,
            fecha,
            hora_entrada: db.Sequelize.literal("GETDATE()"),
          },
          { transaction: t },
        );
        action = "entrada";
      } else {
        // Record exists without hora_salida -> Update with check-out
        fichajeExistente.hora_salida = db.Sequelize.literal("GETDATE()");
        await fichajeExistente.save({ transaction: t });
        fichaje = fichajeExistente;
        action = "salida";
      }

      await t.commit();

      // Fetch the complete record to get actual timestamps
      const fichajeCompleto = await db.CONTROL_ASISTENCIAS.findByPk(
        fichaje.id,
        {
          attributes: ["id", "fecha", "hora_entrada", "hora_salida"],
        },
      );

      return res.status(200).json({
        success: true,
        action,
        usuario: {
          id: usuario.id,
          nomapes: usuario.nomapes,
        },
        fichaje: {
          id: fichajeCompleto.id,
          fecha: fichajeCompleto.fecha,
          hora_entrada: fichajeCompleto.hora_entrada,
          hora_salida: fichajeCompleto.hora_salida,
        },
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error en ficharFlutterHandler:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

module.exports = {
  ficharFlutterHandler,
};
