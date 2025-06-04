const authorizeCategory = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.categoria_laboral.toLowerCase())) {
      return res.status(403).json({ message: "No autorizado" });
    }
    next();
  };
};

module.exports = authorizeCategory;
