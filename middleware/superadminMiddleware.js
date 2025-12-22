require('dotenv').config();
const bcrypt = require('bcrypt');

const verifyAccessSuperAdmin = async (req, res, next) => {
    try {
        const { verify_code_superadmin } = req.body;
        if (!verify_code_superadmin) return res.status(400).json({ message: "Contraseña requerida" });

        const match = bcrypt.compareSync(verify_code_superadmin, process.env.SUPERADMIN_PASSWORD_HASH);
        if (!match) return res.status(403).json({ message: "Contraseña incorrecta" });

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

module.exports = verifyAccessSuperAdmin;