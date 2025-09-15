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
          attributes: ["nombre", "salario"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (password !== user.contrasena) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nomapes: user.nomapes,
        username: user.user_name,
        empresa: user.id_empresa,
        rol: user.rol,
        categoria_laboral: user.categoriaLaboral.nombre,
        canClockIn: user.fichaje_activo
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error("Error durante el login:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  login,
};
