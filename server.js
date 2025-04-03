require("dotenv").config(); //dotenv
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const clientesRoutes = require("./routes/clientesRoutes");
const authRoutes = require("./routes/authRoutes");
const asistenciaRoutes = require("./routes/asistenciaRoutes");
const proyectosRoutes = require("./routes/proyectosRoutes");
const parteRoutes = require("./routes/parteRoutes");
const notificacionesRoutes =  require("./routes/notificacionesRoutes")
const articulosRoutes = require("./routes/articulosRoutes")
const albaranRoutes = require("./routes/albaranRoutes")
const emailRoutes = require("./routes/emailRoutes")
const configuracionesRoutes = require("./routes/configuracionRoutes")
const estadisticasRoutes = require("./routes/estadisticasRoutes")
const vacacionesRoutes = require("./routes/vacacionesRoutes");
const authenticateToken = require("./middleware/authMiddleware");
const fichajesProyectoRoutes = require("./routes/fichajesProyectoRoutes");

const app = express();

const port = process.env.PORT || 0;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit:'10mb',extended: true }));

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
app.use("/api/configuraciones", configuracionesRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/vacaciones", vacacionesRoutes);
app.use("/api/fichajes-proyecto", fichajesProyectoRoutes);
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Acceso autorizado", user: req.user });
});

app.get("/", (req, res) => {
  res.json({ message: "Localhost funciona" });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${port}`);
});
