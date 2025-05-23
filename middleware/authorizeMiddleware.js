const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      const user = req.user;
      if (!user || !allowedRoles.includes(user.rol)) {
        return res.status(403).json({ message: "No autorizado" });
      }
      next();
    };
  };
  
module.exports = authorizeRoles;
  