require("dotenv").config(); //dotenv
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const BASE_API_URL = process.env.BASE_API_URL;
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
const blobStorageRoutes = require("./routes/blobStorageRoutes");
const exportRoutes = require("./routes/exportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const fichajesProyectoRoutes = require("./routes/fichajesProyectoRoutes");
const geolocationRoutes = require("./routes/geolocationRoutes");
const empresaRoutes = require("./routes/empresaRoutes");
const modulosRoutes = require("./routes/modulosRoutes");
const horariosRoutes = require("./routes/horariosRoutes");
const notaGastoRoutes = require("./routes/notaGastoRoutes");
const catLaboralRoutes = require("./routes/categoriaLaboralRoutes");
const pushBrowserRoutes = require("./routes/pushBrowserRoutes");
const flutterFichajeRoutes = require("./routes/flutterFichajeRoutes");
const flutterConfigRoutes = require("./routes/flutterConfigRoutes");
const vb6Routes = require("./routes/vb6Routes");

const authenticateToken = require("./middleware/authMiddleware");

const app = express();

const port = process.env.PORT;

// Declarar rutas
const routes = [
  { path: "auth", router: authRoutes, noBase: true },
  { path: "users", router: userRoutes },
  { path: "asistencia", router: asistenciaRoutes },
  { path: "proyectos", router: proyectosRoutes },
  { path: "articulos", router: articulosRoutes },
  { path: "albaran", router: albaranRoutes },
  { path: "email", router: emailRoutes },
  { path: "clientes", router: clientesRoutes },
  { path: "partes", router: parteRoutes },
  { path: "notificaciones", router: notificacionesRoutes },
  { path: "anotaciones", router: anotacionesRoutes },
  { path: "solicitud", router: solicitudRoutes },
  { path: "configuraciones", router: configuracionesRoutes },
  { path: "estadisticas", router: estadisticasRoutes },
  { path: "vacaciones", router: vacacionesRoutes },
  { path: "fichajes-proyecto", router: fichajesProyectoRoutes },
  { path: "admin", router: adminRoutes },
  { path: "empresa", router: empresaRoutes },
  { path: "modulos", router: modulosRoutes },
  { path: "ftp", router: ftpRoutes },
  { path: "blobStorage", router: blobStorageRoutes },
  { path: "export", router: exportRoutes },
  { path: "geolocation", router: geolocationRoutes },
  { path: "horarios", router: horariosRoutes },
  { path: "categoria-laboral", router: catLaboralRoutes },
  { path: "nota-gasto", router: notaGastoRoutes },
  { path: "push-browser", router: pushBrowserRoutes },
  { path: "flutter-fichaje", router: flutterFichajeRoutes },
  { path: "flutter-config", router: flutterConfigRoutes },
  { path: "vb6", router: vb6Routes },
];

// Middleware para cors
app.use(cors());
app.use(morgan("dev"));

// Middleware para multipart/form-data y json
app.use((req, res, next) => {
  if (req.is("multipart/form-data")) return next();
  express.json({ limit: "10mb" })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ limit: "10mb", extended: true })(req, res, next);
  });
});
// Configurar rutas
routes.forEach(({ path, router, noBase }) => {
  app.use(noBase ? `/${path}` : `${BASE_API_URL}${path}`, router);
});

// Ruta protegida de token
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

process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});
