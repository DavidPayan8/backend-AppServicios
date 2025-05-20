const { sequelize } = require("../../Model");
const { QueryTypes } = require("sequelize");

const getVacaciones = async (
  id_empresa,
  pagina = 1,
  itemsPorPagina = 10,
  ordenarPor = "vacation_id",
  esAscendiente = true,
  filtros = {}
) => {
  try {
    const mapeoOrdenVacaciones = {
      id: "vacation_id",
      empleado: "nomapes",
      comienzo: "FechaComienzo",
      fin: "FechaFin",
      dias: "TotalDias",
      tipo: "TipoNombre",
      estado: "EstadoFinal",
    };

    const offset = (pagina - 1) * itemsPorPagina;
    const direccion = esAscendiente ? "ASC" : "DESC";
    const columnaOrden = mapeoOrdenVacaciones[ordenarPor] || "vacation_id";

    let ordenamientoSQL = `ORDER BY ${columnaOrden} ${direccion}`;
    if (columnaOrden !== "vacation_id") {
      ordenamientoSQL += `, vacation_id ${direccion}`;
    }

    const baseSql = `
    DECLARE @FilteredVacations TABLE (
      vacation_id INT,
      nomapes VARCHAR(50),
      FechaComienzo DATE,
      FechaFin DATE,
      TotalDias INT,
      TipoNombre VARCHAR(50),
      EstadoFinal VARCHAR(9)
    );

    WITH LatestStates AS (
      SELECT ves.id_vacacion, ves.estado
      FROM VACACIONES_ESTADOS ves
      INNER JOIN (
        SELECT id_vacacion, MAX(tiempo) AS max_tiempo
        FROM VACACIONES_ESTADOS
        GROUP BY id_vacacion
      ) latest_state_time ON ves.id_vacacion = latest_state_time.id_vacacion AND ves.tiempo = max_tiempo
    ),
    VacationDetailsAggregated AS (
      SELECT
        v.id AS vacation_id,
        v.id_usuario,
        v.tipo AS vacation_type_id,
        MIN(dv.dia) AS FechaComienzo,
        MAX(dv.dia) AS FechaFin,
        COUNT(dv.dia) AS TotalDias
      FROM VACACIONES v
      INNER JOIN DIAS_VACACION dv ON v.id = dv.id_vacacion
      GROUP BY v.id, v.id_usuario, v.tipo
    ),
    VacationsWithFinalState AS (
      SELECT
        vd.vacation_id,
        vd.id_usuario,
        vd.vacation_type_id,
        vd.FechaComienzo,
        vd.FechaFin,
        vd.TotalDias,
        ISNULL(ls.estado, 'pendiente') AS EstadoFinal
      FROM VacationDetailsAggregated vd
      LEFT JOIN LatestStates ls ON vd.vacation_id = ls.id_vacacion
    ),
    SourceForFilteredVacations AS (
      SELECT
        vwfs.vacation_id,
        u.nomapes,
        vwfs.FechaComienzo,
        vwfs.FechaFin,
        vwfs.TotalDias,
        t.nombre AS TipoNombre,
        vwfs.EstadoFinal
      FROM VacationsWithFinalState vwfs
      INNER JOIN USUARIOS u ON vwfs.id_usuario = u.id
      INNER JOIN TIPOS_VACACION t ON vwfs.vacation_type_id = t.id
      WHERE u.id_empresa = (SELECT id_empresa FROM USUARIOS WHERE id = :id_empresa)
        AND (:nomapes IS NULL OR u.nomapes COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE '%' + :nomapes + '%')
        AND (:tipoNombre IS NULL OR t.nombre COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE '%' + :tipoNombre + '%')
        AND (:estado IS NULL OR vwfs.EstadoFinal = :estado)
        AND (:fecha IS NULL OR EXISTS (
          SELECT 1 FROM DIAS_VACACION dv_filter
          WHERE dv_filter.id_vacacion = vwfs.vacation_id AND dv_filter.dia = :fecha
        ))
    )

    INSERT INTO @FilteredVacations
    SELECT vacation_id, nomapes, FechaComienzo, FechaFin, TotalDias, TipoNombre, EstadoFinal
    FROM SourceForFilteredVacations;

    SELECT
      vacation_id AS id,
      nomapes AS empleado,
      CONVERT(VARCHAR(10), FechaComienzo, 120) AS comienzo,
      CONVERT(VARCHAR(10), FechaFin, 120) AS fin,
      TotalDias AS dias,
      EstadoFinal AS estado,
      TipoNombre AS tipo
    FROM @FilteredVacations
    ORDER BY ${columnaOrden} ${direccion}
    OFFSET :offset ROWS
    FETCH NEXT :filas ROWS ONLY;
  `;

    const countSql = `
    DECLARE @FilteredVacations TABLE (
      vacation_id INT,
      nomapes VARCHAR(50),
      FechaComienzo DATE,
      FechaFin DATE,
      TotalDias INT,
      TipoNombre VARCHAR(50),
      EstadoFinal VARCHAR(9)
    );

    WITH LatestStates AS (
      SELECT ves.id_vacacion, ves.estado
      FROM VACACIONES_ESTADOS ves
      INNER JOIN (
        SELECT id_vacacion, MAX(tiempo) AS max_tiempo
        FROM VACACIONES_ESTADOS
        GROUP BY id_vacacion
      ) latest_state_time ON ves.id_vacacion = latest_state_time.id_vacacion AND ves.tiempo = max_tiempo
    ),
    VacationDetailsAggregated AS (
      SELECT
        v.id AS vacation_id,
        v.id_usuario,
        v.tipo AS vacation_type_id,
        MIN(dv.dia) AS FechaComienzo,
        MAX(dv.dia) AS FechaFin,
        COUNT(dv.dia) AS TotalDias
      FROM VACACIONES v
      INNER JOIN DIAS_VACACION dv ON v.id = dv.id_vacacion
      GROUP BY v.id, v.id_usuario, v.tipo
    ),
    VacationsWithFinalState AS (
      SELECT
        vd.vacation_id,
        vd.id_usuario,
        vd.vacation_type_id,
        vd.FechaComienzo,
        vd.FechaFin,
        vd.TotalDias,
        ISNULL(ls.estado, 'pendiente') AS EstadoFinal
      FROM VacationDetailsAggregated vd
      LEFT JOIN LatestStates ls ON vd.vacation_id = ls.id_vacacion
    ),
    SourceForFilteredVacations AS (
      SELECT
        vwfs.vacation_id,
        u.nomapes,
        vwfs.FechaComienzo,
        vwfs.FechaFin,
        vwfs.TotalDias,
        t.nombre AS TipoNombre,
        vwfs.EstadoFinal
      FROM VacationsWithFinalState vwfs
      INNER JOIN USUARIOS u ON vwfs.id_usuario = u.id
      INNER JOIN TIPOS_VACACION t ON vwfs.vacation_type_id = t.id
      WHERE u.id_empresa = (SELECT id_empresa FROM USUARIOS WHERE id = :id_empresa)
        AND (:nomapes IS NULL OR u.nomapes COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE '%' + :nomapes + '%')
        AND (:tipoNombre IS NULL OR t.nombre COLLATE SQL_Latin1_General_Cp1_CI_AI LIKE '%' + :tipoNombre + '%')
        AND (:estado IS NULL OR vwfs.EstadoFinal = :estado)
        AND (:fecha IS NULL OR EXISTS (
          SELECT 1 FROM DIAS_VACACION dv_filter
          WHERE dv_filter.id_vacacion = vwfs.vacation_id AND dv_filter.dia = :fecha
        ))
    )

    INSERT INTO @FilteredVacations
    SELECT vacation_id, nomapes, FechaComienzo, FechaFin, TotalDias, TipoNombre, EstadoFinal
    FROM SourceForFilteredVacations;

    SELECT COUNT(*) AS total FROM @FilteredVacations;
  `;

    const replacements = {
      id_empresa,
      nomapes: filtros?.empleado?.trim()?.toLowerCase() || null,
      tipoNombre: filtros?.tipo?.trim()?.toLowerCase() || null,
      estado: filtros?.estado || null,
      fecha: filtros?.fecha || null,
      filas: itemsPorPagina,
      offset,
    };

    const vacaciones = await sequelize.query(baseSql, {
      replacements,
      type: QueryTypes.SELECT,
      raw: true,
    });

    const totalResult = await sequelize.query(countSql, {
      replacements,
      type: QueryTypes.SELECT,
      raw: true,
    });

    return {
      vacaciones,
      total: totalResult?.[0]?.total || 0,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  getVacaciones,
};
