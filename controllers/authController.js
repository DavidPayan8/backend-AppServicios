const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../Model");
const JWT_SECRET = process.env.JWT_SECRET;

// Helpers
const createToken = (userPlain, horario) => {
  return jwt.sign(
    {
      id: userPlain.id,
      nomapes: userPlain.nomapes,
      username: userPlain.user_name,
      empresa: userPlain.id_empresa,
      rol: userPlain.rol,
      categoria_laboral: userPlain.categoriaLaboral?.codigo_rol,
      canClockIn: userPlain.fichaje_activo,
      horario,
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
};

const resolveHorario = async (idUsuario, hoy, diaSemana) => {
  const asignacion = await db.ASIGNACION_HORARIO_USUARIO.findOne({
    where: {
      id_usuario: idUsuario,
      activo: true,
      fecha_asignacion: { [Op.lte]: hoy },
      [Op.or]: [{ fecha_fin: { [Op.gte]: hoy } }, { fecha_fin: null }],
    },
    include: [
      {
        model: db.HORARIOS_PLANTILLA,
        as: "horario",
        attributes: ["id_horario", "nombre", "descripcion"],
        include: [
          {
            model: db.HORARIOS_TRAMOS,
            as: "tramos",
            attributes: ["id_tramo", "hora_inicio", "hora_fin", "descripcion"],
            include: [
              {
                model: db.HORARIOS_DETALLE_DIA,
                as: "detallesDias",
                attributes: ["dia_semana", "activo"],
                where: {
                  dia_semana: diaSemana,
                  activo: true,
                },
                required: true,
              },
            ],
          },
        ],
      },
    ],
  });

  if (!asignacion?.horario) return null;

  return {
    id_horario: asignacion.horario.id_horario,
    nombre: asignacion.horario.nombre,
    tramos: asignacion.horario.tramos.map((t) => ({
      hora_inicio: t.hora_inicio,
      hora_fin: t.hora_fin,
      descripcion: t.descripcion,
      dias_semana: t.detallesDias?.map((d) => ({
        dia: d.dia_semana,
        activo: d.activo,
      })) ?? [],
    })),
  };
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar usuario
    const user = await db.USUARIOS.findOne({
      where: { user_name: username },
      include: [
        {
          model: db.CATEGORIA_LABORAL,
          as: "categoriaLaboral",
          attributes: ["nombre", "codigo_rol"],
        },
      ],
    });

    if (!user) return res.status(401).json({ message: "Credenciales incorrectas" });

    const passwordValida = await bcrypt.compare(password, user.contrasena);
    if (!passwordValida) return res.status(401).json({ message: "Contraseña incorrecta" });

    // Horario correspondiente
    const hoy = new Date();
    const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay();
    const horario = await resolveHorario(user.id, hoy, diaSemana);

    // Token y usuario limpio
    const userPlain = user.toJSON();
    const token = createToken(userPlain, horario);

    const {
      id,
      id_origen,
      rol,
      id_empresa,
      fichaje_activo,
      contrasena,
      categoriaLaboral,
      categoria_laboral_id,
      ...userFormated
    } = userPlain;

    return res.status(200).json({
      token,
      user: {
        ...userFormated,
        horario,
      },
    });
  } catch (err) {
    console.error("Error durante el login:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = { login };
