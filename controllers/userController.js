const { getUsers } = require('../models/userModel');

const getUsersHandler = async (req, res) => {
  try {
    let users = await getUsers();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  getUsers: getUsersHandler
};