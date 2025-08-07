require("dotenv").config(); //dotenv
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");
const clientesRoutes = require("./routes/clientesRoutes");
const authRoutes = require("./routes/authRoutes");
const asistenciaRoutes = require("./routes/asistenciaRoutes");
const proyectosRoutes = require("./routes/proyectosRoutes");
const parteRoutes = require("./routes/parteRoutes");
const notificacionesRoutes = require("./routes/notificacionesRoutes");
const anotacionesRoutes = require("./routes/anotacionesRoutes");
const solicitudRoutes = require("./routes/solicitudRoutes");
const articulosRoutes = require("./routes/articulosRoutes");
const albaranRoutes = require("./routes/albaranRoutes");
const emailRoutes = require("./routes/emailRoutes");
const configuracionesRoutes = require("./routes/configuracionRoutes");
const estadisticasRoutes = require("./routes/estadisticasRoutes");
const vacacionesRoutes = require("./routes/vacacionesRoutes");
const ftpRoutes = require("./routes/ftpRoutes");
const adminRoutes = require("./routes/adminRoutes");
const fichajesProyectoRoutes = require("./routes/fichajesProyectoRoutes");
const geolocationRoutes = require("./routes/geolocationRoutes");
const empresaRoutes = require("./routes/empresaRoutes");
const modulosRoutes = require("./routes/modulosRoutes");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();

const port = process.env.PORT || 0;

// Middleware para cors
app.use(cors());
app.use(morgan("dev"));

// Middleware para JSON y URL-encoded de forma condicional
app.use((req, res, next) => {
  if (req.is("application/json")) {
    express.json({ limit: "10mb" })(req, res, next);
  } else if (req.is("application/x-www-form-urlencoded")) {
    express.urlencoded({ limit: "10mb", extended: true })(req, res, next);
  } else {
    next();
  }
});

// Rutas
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/asistencia", asistenciaRoutes);
app.use("/api/proyectos", proyectosRoutes);
app.use("/api/articulos", articulosRoutes);
app.use("/api/albaran", albaranRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/partes", parteRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/anotaciones", anotacionesRoutes);
app.use("/api/solicitud", solicitudRoutes)
app.use("/api/configuraciones", configuracionesRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/vacaciones", vacacionesRoutes);
app.use("/api/fichajes-proyecto", fichajesProyectoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/empresa", empresaRoutes);
app.use("/api/modulos", modulosRoutes);
app.use("/api/ftp", ftpRoutes);
app.use("/api/geolocation", geolocationRoutes);

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Acceso autorizado", user: req.user });
});

// Ruta para verificar que el servidor funciona
app.get("/", (req, res) => {
  res.json({ message: "Levantado" });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Node.js corriendo en puerto ${port}`);
});
