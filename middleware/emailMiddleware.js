const validateEmail = (req, res, next) => {
    const { email, pdf } = req.body;
  
    // Verificar que el email está presente y tiene un formato válido
    if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(400).json({ message: 'Email inválido o no proporcionado.' });
    }
  
    // Verificar que el PDF en base64 está presente y parece válido
    if (!pdf || !/^([A-Za-z0-9+/=]{4})*([A-Za-z0-9+/=]{3}=|[A-Za-z0-9+/=]{2}==)?$/.test(pdf)) {
      return res.status(400).json({ message: 'PDF en formato base64 inválido o no proporcionado.' });
    }
  
    console.log("pasa el validateEmail")
    // Si todo está correcto, continúa al controlador
    next();
  };
  
  module.exports = validateEmail;
  