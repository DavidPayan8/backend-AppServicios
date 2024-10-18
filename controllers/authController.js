const jwt = require("jsonwebtoken");
const { getUserByUsername } = require("../models/userModel");

const JWT_SECRET = "111";

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
    if (password !== user.contrasena) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generar un nuevo token JWT
    const token = jwt.sign(
      { id: user.id, username: user.nomapes },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  login,
};
