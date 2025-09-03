const db = require("../Model");
const identidad = require("../shared/identidad");

// Obtener todos los usuarios de una empresa
const getUsersHandler = async (req, res) => {
  const { empresa } = req.user;

  try {
    const users = await db.USUARIOS.findAll({
      where: { id_empresa: empresa },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Obtener perfil del usuario autenticado
const getPerfilHandler = async (req, res) => {
  try {
    const user = await db.USUARIOS.findByPk(req.user.id, {
      attributes: {
        exclude: ["contrasena", "id_empresa", "id_origen", "id_config", "id"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener perfil del usuario:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Actualizar perfil del usuario autenticado
const actualizarPerfilHandler = async (req, res) => {
  try {
    const {
      nombreApellidos,
      password,
      dni,
      seguridadSocial,
      email,
      telefono,
      sexo,
    } = req.body;

    // Validación de DNI/NIE
    if (!identidad.esDniValido(dni) && !identidad.esNieValido(dni)) {
      console.log("No es valido");
      return res.status(400).json({ message: "DNI no válido" });
    }

    // Validación de sexo
    const sexoValido = ["x", "m", "f"];
    if (!sexoValido.includes(sexo?.toLowerCase())) {
      return res.status(400).json({ message: "Sexo debe ser 'x', 'm' o 'f'" });
    }

    // Verificar si el DNI ya está en uso por otro usuario
    const dniExistente = await db.USUARIOS.findOne({
      where: {
        dni,
        id: { [db.Sequelize.Op.ne]: req.user.id },
      },
    });

    if (dniExistente) {
      return res.status(409).json({ message: "DNI en uso" });
    }

    // Actualizar
    const updateData = {
      nomapes: nombreApellidos,
      DNI: dni,
      num_seguridad_social: seguridadSocial,
      email,
      telefono,
      sexo: sexo.toUpperCase(),
    };
    if (password) {
      updateData.contrasena = password;
    }

    await db.USUARIOS.update(updateData, {
      where: { id: req.user.id },
      logging: console.log,
    });

    res.status(200).json({ message: "Actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar perfil:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Marcar primer inicio como completado
const cambiarPrimerInicio = async (req, res) => {
  try {
    await db.USUARIOS.update(
      { primer_inicio: false },
      { where: { id: req.user.id } }
    );

    res.status(200).json({ message: "Actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar primer inicio:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  getUsers: getUsersHandler,
  getPerfil: getPerfilHandler,
  actualizarPerfil: actualizarPerfilHandler,
  cambiarPrimerInicio,
};
