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

    // Subconsulta: obtener los últimos estados por vacación
    const subqueryEstados = `
      SELECT ve.id_vacacion, ve.estado
      FROM VACACIONES_ESTADOS ve
      INNER JOIN (
        SELECT id_vacacion, MAX(tiempo) AS MaxTiempo
        FROM VACACIONES_ESTADOS
        GROUP BY id_vacacion
      ) latest ON ve.id_vacacion = latest.id_vacacion AND ve.tiempo = latest.MaxTiempo
    `;

    // Consulta 1: días ACEPTADOS
    const [aceptadosRaw] = await db.sequelize.query(
      `
      SELECT COUNT(dv.dia) AS TotalDiasAceptados
      FROM VACACIONES v
      INNER JOIN (${subqueryEstados}) lvs ON v.id = lvs.id_vacacion
      INNER JOIN DIAS_VACACION dv ON v.id = dv.id_vacacion
      WHERE v.id_usuario = :idUsuario AND lvs.estado = 'aceptado'
      `,
      {
        replacements: { idUsuario },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );
    vacaciones.aceptadas = aceptadosRaw.TotalDiasAceptados || 0;

    // Consulta 2: días SOLICITADOS
    const [solicitadosRaw] = await db.sequelize.query(
      `
      WITH LatestVacationState AS (
        SELECT ve.id_vacacion, ve.estado
        FROM VACACIONES_ESTADOS ve
        INNER JOIN (
          SELECT id_vacacion, MAX(tiempo) AS MaxTiempo
          FROM VACACIONES_ESTADOS
          GROUP BY id_vacacion
        ) latest ON ve.id_vacacion = latest.id_vacacion AND ve.tiempo = latest.MaxTiempo
      ),
      UserVacationsWithCurrentState AS (
        SELECT v.id AS id_vacacion, COALESCE(lvs.estado, 'solicitado') AS CurrentEstado
        FROM VACACIONES v
        LEFT JOIN LatestVacationState lvs ON v.id = lvs.id_vacacion
        WHERE v.id_usuario = :idUsuario
      )
      SELECT COUNT(dv.dia) AS TotalDiasSolicitados
      FROM UserVacationsWithCurrentState uvwcs
      INNER JOIN DIAS_VACACION dv ON uvwcs.id_vacacion = dv.id_vacacion
      WHERE uvwcs.CurrentEstado = 'solicitado'
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
    const user = await db.USUARIOS.findByPk(idUsuario, {
      attributes: ["id_empresa"],
    });

    const totalDisponibles = await db.TIPOS_VACACION.sum("cantidad_dias", {
      where: {
        [Op.or]: [{ id_empresa: null }, { id_empresa: user.id_empresa }],
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
      WITH LatestStates AS (
					-- CTE para encontrar el estado más reciente para cada vacación que tiene estados
					SELECT
						ves.id_vacacion,
						ves.estado
					FROM VACACIONES_ESTADOS ves
					INNER JOIN (
						-- Encuentra el tiempo máximo para cada vacación
						SELECT id_vacacion, MAX(tiempo) AS max_tiempo
						FROM VACACIONES_ESTADOS
						GROUP BY id_vacacion
					) AS latest_state_time ON ves.id_vacacion = latest_state_time.id_vacacion AND ves.tiempo = latest_state_time.max_tiempo
				)
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia -- Día de la vacación en formato 'YYYY-MM-DD'
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id -- Une con la tabla de vacaciones para filtrar por usuario y tipo
				LEFT JOIN LatestStates ls ON v.id = ls.id_vacacion -- Intenta unir con el estado más reciente (si existe)
				WHERE v.id_usuario = :UserId -- Filtra por el ID del usuario
				AND v.tipo = :TipoId -- Filtra por el tipo de vacación
				AND (
					ls.estado IS NULL -- Incluye vacaciones sin estado (se consideran 'solicitado')
					OR ls.estado = 'solicitado' -- Incluye vacaciones cuyo estado más reciente es 'solicitado'
				);
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
      WITH LatestStates AS (
					-- CTE para encontrar el estado más reciente para cada vacación que tiene estados
					SELECT
						ves.id_vacacion,
						ves.estado
					FROM VACACIONES_ESTADOS ves
					INNER JOIN (
						-- Encuentra el tiempo máximo para cada vacación
						SELECT id_vacacion, MAX(tiempo) AS max_tiempo
						FROM VACACIONES_ESTADOS
						GROUP BY id_vacacion
					) AS latest_state_time ON ves.id_vacacion = latest_state_time.id_vacacion AND ves.tiempo = latest_state_time.max_tiempo
				)
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia -- Día de la vacación en formato 'YYYY-MM-DD'
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id -- Une con la tabla de vacaciones para filtrar por usuario y tipo
				LEFT JOIN LatestStates ls ON v.id = ls.id_vacacion -- Intenta unir con el estado más reciente (si existe)
				WHERE v.id_usuario = :UserId -- Filtra por el ID del usuario
				AND v.tipo = :TipoId -- Filtra por el tipo de vacación
				AND ls.estado = 'aceptado'; -- Filtra solo las que tienen estado 'aceptado' como el más reciente
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
     WITH LatestStates AS (
					-- CTE para encontrar el estado, el tiempo y la razon del estado más reciente
					-- para cada vacación que tiene estados.
					SELECT
						ves.id_vacacion,
						ves.estado,
						ves.razon -- Incluimos la razon del estado más reciente
					FROM VACACIONES_ESTADOS ves
					INNER JOIN (
						-- Encuentra el tiempo máximo para cada vacación
						SELECT id_vacacion, MAX(tiempo) AS max_tiempo
						FROM VACACIONES_ESTADOS
						GROUP BY id_vacacion
					) AS latest_state_time ON ves.id_vacacion = latest_state_time.id_vacacion AND ves.tiempo = latest_state_time.max_tiempo
				)
				SELECT
					v.id, -- ID de la vacación
					CONVERT(VARCHAR(10), dv.dia, 120) AS dia, -- Día de la vacación en formato 'YYYY-MM-DD'
					ls.razon -- Seleccionamos la razon del estado más reciente (que filtraremos para que sea 'denegado')
				FROM DIAS_VACACION dv
				INNER JOIN VACACIONES v ON dv.id_vacacion = v.id -- Une con la tabla de vacaciones para filtrar por usuario y tipo
				INNER JOIN LatestStates ls ON v.id = ls.id_vacacion -- Une con el estado más reciente. Usamos INNER JOIN porque solo nos interesan las vacaciones *con* un estado denegado explícito.
				WHERE v.id_usuario = :UserId -- Filtra por el ID del usuario
				AND v.tipo = :TipoId -- Filtra por el tipo de vacación
				AND ls.estado = 'denegado'; -- Filtra solo las que tienen estado 'denegado' como el más reciente
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
      aceptado: false,
    });

    const diasRows = dias.map((diaStr) => {
      const dia = new Date(diaStr);
      return { id_vacacion: vacation.id, dia };
    });

    await db.DIAS_VACACION.bulkCreate(diasRows);

    return res
      .status(201)
      .json({ message: "Vacaciones solicitadas con exito" });
  } catch (error) {
    console.error("Error al solicitar vacaciones:", error.message);
    return res.status(500).json({ error: "Error al solicitar vacaciones" });
  }
};

module.exports = {
  obtenerTotalVacaciones: obtenerTotalVacacionesHandler,
  obtenerTiposVacacion: obtenerTiposVacacionHandler,
  obtenerVacacionesAceptadas: obtenerVacacionesAceptadasHandler,
  obtenerVacacionesDenegadas: obtenerVacacionesDenegadasHandler,
  obtenerVacacionesSolicitadas: obtenerVacacionesSolicitadasHandler,
  solicitarVacaciones: solicitarVacacionesHandler,
};
