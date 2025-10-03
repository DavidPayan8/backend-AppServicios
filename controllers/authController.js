const jwt = require("jsonwebtoken");
const db = require("../Model");

const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
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

    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    if (password !== user.contrasena) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const userPlain = user.toJSON();

    const token = jwt.sign(
      {
        id: userPlain.id,
        nomapes: userPlain.nomapes,
        username: userPlain.user_name,
        empresa: userPlain.id_empresa,
        rol: userPlain.rol,
        categoria_laboral: userPlain.categoriaLaboral?.codigo_rol,
        canClockIn: userPlain.fichaje_activo
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    const { id, id_origen, rol, id_empresa, fichaje_activo, contrasena, categoriaLaboral, categoria_laboral_id, ...userFormated } = userPlain;

    return res.status(200).json({ token, user: userFormated });
  } catch (err) {
    console.error("Error durante el login:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  login,
};
