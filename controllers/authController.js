const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserByUsername } = require('../models/userModel');

const JWT_SECRET = '111';

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      res.status(401).json({ message: 'Invalid user' });
    }else if (password != user.contrasena) {
      res.status(401).json({ message: 'Invalid password' });
    }else{
      const token = jwt.sign({ id: user.id, username: user.nomapes }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    }
  } catch (err) {
    /* res.error('Error al iniciar sesión:', err); */
    res.status(500).json({ message: err });
  }
};

module.exports = {
  login
};
