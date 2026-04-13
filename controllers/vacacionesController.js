const db = require("../Model");
const { Op } = require("sequelize");

const obtenerTotalVacacionesHandler = async (req, res) => {
  const idUsuario = req.user.id;

  try {
    const vacaciones = {
      aceptadas: 0,
      solicitadas: 0,
      pendientes: 0,
    };

    // Consulta 1: días ACEPTADOS (solo tipos que descuentan vacaciones)
    const [aceptadosRaw] = await db.sequelize.query(
      `
      SELECT COUNT(dv.dia) AS TotalDiasAceptados
      FROM DIAS_VACACION dv
      INNER JOIN VACACIONES v ON v.id = dv.id_vacacion
      INNER JOIN TIPOS_VACACION tv ON tv.id = v.tipo
      WHERE v.id_usuario = :idUsuario AND dv.estado IN ('aceptado', 'aceptada')
      AND tv.descuenta_vacaciones = 1
      `,
      {
        replacements: { idUsuario },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    vacaciones.aceptadas = aceptadosRaw.TotalDiasAceptados || 0;

    // Consulta 2: días SOLICITADOS (solo tipos que descuentan vacaciones)
    const [solicitadosRaw] = await db.sequelize.query(
      `
      SELECT COUNT(dv.dia) AS TotalDiasSolicitados
      FROM DIAS_VACACION dv
      INNER JOIN VACACIONES v ON v.id = dv.id_vacacion
      INNER JOIN TIPOS_VACACION tv ON tv.id = v.tipo
      WHERE v.id_usuario = :idUsuario AND dv.estado IN ('solicitado', 'solicitada')
      AND tv.descuenta_vacaciones = 1
      `,
      {
        replacements: { idUsuario },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );
    vacaciones.solicitadas = solicitadosRaw.TotalDiasSolicitados || 0;

    // Total usados
    const total = vacaciones.aceptadas + vacaciones.solicitadas;

    // Consulta 3: días disponibles (por tipo de vacación de empresa o global)
    const totalDisponibles = await
  db.SALDO_VACACIONES.sum("cantidad_dias", {
    where: {
      id_usuario: idUsuario,
    },
  });

    vacaciones.pendientes = (totalDisponibles || 0) - total;

    return res.status(200).json(vacaciones);
  } catch (error) {
    console.error("Error al obtener vacaciones:", error.message);
    return res.status(500).json({ error: "Error al obtener vacaciones" });
  }
};

const obtenerTiposVacacionHandler = async (req, res) => {
  const empresaId = req.user.empresa;

  try {
    const tipos = await db.TIPOS_VACACION.findAll({
      where: {
        id_empresa: empresaId,
      },
      attributes: [
        "id",
        "nombre",
        ["cantidad_dias", "dias"],
        "es_dias_naturales",
      ],
    });

    return res.status(200).json(tipos);
  } catch (error) {
    console.error("Error al obtener tipos de vacacion:", error.message);
    return res
      .status(500)
      .json({ error: "Error al obtener tipos de vacacion" });
  }
};

const obtenerVacacionesSolicitadasHandler = async (req, res) => {
  const { tipo } = req.body;
  const idUsuario = req.user.id;

  try {
    const dias = await db.sequelize.query(
      `
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia -- Día de la vacación en formato 'YYYY-MM-DD'
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id
				WHERE v.id_usuario = :UserId
				AND v.tipo = :TipoId
				AND dv.estado IN ('solicitado', 'solicitada');
    `,
      {
        replacements: {
          UserId: idUsuario,
          TipoId: tipo,
        },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json(dias);
  } catch (error) {
    console.error("Error al obtener vacaciones solicitadas:", error.message);
    return res
      .status(500)
      .json({ error: "Error al obtener vacaciones solicitadas" });
  }
};

const obtenerVacacionesAceptadasHandler = async (req, res) => {
  const { tipo } = req.body;
  const idUsuario = req.user.id;

  try {
    const dias = await db.sequelize.query(
      `
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia -- Día de la vacación en formato 'YYYY-MM-DD'
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id
				WHERE v.id_usuario = :UserId
				AND v.tipo = :TipoId
				AND dv.estado IN ('aceptado', 'aceptada');
    `,
      {
        replacements: {
          UserId: idUsuario,
          TipoId: tipo,
        },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );
    return res.status(200).json(dias);
  } catch (error) {
    console.error("Error al obtener vacaciones aceptadas:", error.message);
    return res
      .status(500)
      .json({ error: "Error al obtener vacaciones aceptadas" });
  }
};

const obtenerVacacionesDenegadasHandler = async (req, res) => {
  const { tipo } = req.body;
  const idUsuario = req.user.id;

  try {
    const dias = await db.sequelize.query(
      `
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia, -- Día de la vacación en formato 'YYYY-MM-DD'
					dv.razon
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id
				WHERE v.id_usuario = :UserId
				AND v.tipo = :TipoId
				AND dv.estado IN ('denegado', 'denegada');
    `,
      {
        replacements: {
          UserId: idUsuario,
          TipoId: tipo,
        },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json(dias);
  } catch (error) {
    console.error("Error al obtener vacaciones denegadas:", error.message);
    return res
      .status(500)
      .json({ error: "Error al obtener vacaciones denegadas" });
  }
};

const obtenerDiasVacacionesHandler = async (req, res) => {
  const { tipo } = req.body;
  const idUsuario = req.user.id;

  try {
    const dias = await db.sequelize.query(
      `
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia, -- Día de la vacación en formato 'YYYY-MM-DD'
					dv.estado
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id
				WHERE v.id_usuario = :UserId
				AND v.tipo = :TipoId;
    `,
      {
        replacements: {
          UserId: idUsuario,
          TipoId: tipo,
        },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json(dias);
  } catch (error) {
    console.error("Error al obtener dias de vacaciones:", error.message);
    return res
      .status(500)
      .json({ error: "Error al obtener dias de vacaciones" });
  }
};

const obtenerResumenVacacionesHandler = async (req, res) => {
  const { tipo } = req.body;
  const idUsuario = req.user.id;

  try {
    // 1. Total disponible del tipo de vacación
  const saldoVacacion = await
  db.SALDO_VACACIONES.findOne({
  where: { id_usuario: idUsuario, tipo: tipo },
  attributes: ["cantidad_dias"],
  });
  const diasTotales = saldoVacacion?.cantidad_dias || 0;

    // 2. Días solicitados (sin aprobar aún)
    const diasSolicitados = await db.sequelize.query(
      `SELECT COUNT(*) AS total FROM DIAS_VACACION dv
       INNER JOIN VACACIONES v ON dv.id_vacacion = v.id
       INNER JOIN TIPOS_VACACION tv ON tv.id = v.tipo
       WHERE v.id_usuario = :idUsuario AND v.tipo = :tipo
       AND dv.estado IN ('solicitado', 'solicitada')
       AND tv.descuenta_vacaciones = 1`,
      { replacements: { idUsuario, tipo }, type: db.Sequelize.QueryTypes.SELECT }
    );

    // 3. Días aprobados futuros (no usados aún)
    const diasAprobadosFuturos = await db.sequelize.query(
      `SELECT COUNT(*) AS total FROM DIAS_VACACION dv
       INNER JOIN VACACIONES v ON dv.id_vacacion = v.id
       INNER JOIN TIPOS_VACACION tv ON tv.id = v.tipo
       WHERE v.id_usuario = :idUsuario AND v.tipo = :tipo
       AND dv.estado IN ('aceptado', 'aceptada')
       AND tv.descuenta_vacaciones = 1
       AND CONVERT(DATE, dv.dia) > CONVERT(DATE, GETDATE())`,
      { replacements: { idUsuario, tipo }, type: db.Sequelize.QueryTypes.SELECT }
    );

    // 4. Días aprobados pasados (usados)
    const diasUsados = await db.sequelize.query(
      `SELECT COUNT(*) AS total FROM DIAS_VACACION dv
       INNER JOIN VACACIONES v ON dv.id_vacacion = v.id
       INNER JOIN TIPOS_VACACION tv ON tv.id = v.tipo
       WHERE v.id_usuario = :idUsuario AND v.tipo = :tipo
       AND dv.estado IN ('aceptado', 'aceptada')
       AND tv.descuenta_vacaciones = 1
       AND CONVERT(DATE, dv.dia) <= CONVERT(DATE, GETDATE())`,
      { replacements: { idUsuario, tipo }, type: db.Sequelize.QueryTypes.SELECT }
    );

    // 5. Calcular disponibles
    const diasSolicitadosTotal = diasSolicitados[0]?.total || 0;
    const diasAprobadosTotal = (diasAprobadosFuturos[0]?.total || 0) + (diasUsados[0]?.total || 0);
    const diasDisponibles = diasTotales - diasSolicitadosTotal - diasAprobadosTotal;

    return res.status(200).json({
      diasTotales,
      diasDisponibles: Math.max(0, diasDisponibles),
      diasAprobados: diasAprobadosFuturos[0]?.total || 0,
      diasUsados: diasUsados[0]?.total || 0,
      diasSolicitados: diasSolicitadosTotal,
    });
  } catch (error) {
    console.error("Error al obtener resumen de vacaciones:", error.message);
    return res.status(500).json({ error: "Error al obtener resumen de vacaciones" });
  }
};

const solicitarVacacionesHandler = async (req, res) => {
  const { tipo, dias } = req.body;
  const id_usuario = req.user.id;

  try {
    // Verificar si los días son válidos
    for (const diaStr of dias) {
      const dia = new Date(diaStr);

      if (isNaN(dia.getTime())) {
        return res.status(400).json({ error: "Fecha inválida" });
      }

      const existingVacation = await db.DIAS_VACACION.findOne({
        include: {
          model: db.VACACIONES,
          as: "vacacion",
          where: { id_usuario },
          required: true,
        },
        where: { dia },
      });

      if (existingVacation) {
        return res
          .status(400)
          .json({ error: "Vacación existente para la fecha" });
      }
    }

    const vacation = await db.VACACIONES.create({
      tipo,
      id_usuario,
      fecha_solicitud: new Date(),
    });

    console.log(vacation.id);

    const diasRows = dias.map((diaStr) => {
      const dia = new Date(diaStr);
      return {
        id_vacacion: vacation.id,
        dia,
        estado: "solicitado",
      };
    });

    await db.DIAS_VACACION.bulkCreate(diasRows);

    return res
      .status(201)
      .json({ message: "Vacaciones solicitadas con exito" });
  } catch (err) {
    console.log("Error al solicitar vacaciones:", err);
    if (err.original?.errors) {
      err.original.errors.forEach((e) => {
        console.error("SQL ERROR:", e.message);
      });
    }
    return res.status(500).json({ error: "Error al solicitar vacaciones" });
  }
};

module.exports = {
  obtenerTotalVacaciones: obtenerTotalVacacionesHandler,
  obtenerTiposVacacion: obtenerTiposVacacionHandler,
  obtenerVacacionesAceptadas: obtenerVacacionesAceptadasHandler,
  obtenerVacacionesDenegadas: obtenerVacacionesDenegadasHandler,
  obtenerVacacionesSolicitadas: obtenerVacacionesSolicitadasHandler,
  obtenerDiasVacaciones: obtenerDiasVacacionesHandler,
  obtenerResumenVacaciones: obtenerResumenVacacionesHandler,
  solicitarVacaciones: solicitarVacacionesHandler,
};
