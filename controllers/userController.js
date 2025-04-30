const {
  getUsers,
  getUserById,
  actualizarPerfil,
  actualizarPrimerInicio,
} = require("../models/userModel");
const identidad = require("../shared/identidad");

const getUsersHandler = async (req, res) => {
  const { empresa } = req.user;
  try {
    let users = await getUsers(empresa);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const getPerfilHandler = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    // Información confidencial
    user.contrasena = undefined;
    user.id_empresa = undefined;
    user.id = undefined;
    user.id_origen = undefined;
    user.id_config = undefined;

    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error.message);
    res.status(500).send("Error del servidor");
  }
};

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

    // Validación
    if (!identidad.esDniValido(dni) && !identidad.esNieValido(dni)) {
      res.status(400).send({ message: "DNI inválido" });
      return;
    }

    await actualizarPerfil(
      req.user.id,
      nombreApellidos,
      password,
      dni,
      seguridadSocial,
      email,
      telefono,
      sexo
    );
    res.status(200).send();
  } catch (error) {
    console.error("Error al actualizar perfil:", error.message);
    res.status(500).send("Error del servidor");
  }
};

const cambiarPrimerInicio = async (req, res) => {
  try {
    await actualizarPrimerInicio(req.user.id);
    res.status(200).send();
  } catch (error) {
    console.error("Error al actualizar perfil:", error.message);
    res.status(500).send("Error del servidor");
  }
};

module.exports = {
  getUsers: getUsersHandler,
  getPerfil: getPerfilHandler,
  actualizarPerfil: actualizarPerfilHandler,
  cambiarPrimerInicio,
};
