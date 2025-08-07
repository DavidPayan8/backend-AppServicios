const express = require("express");
const {
  obtenerListadoFtp,
  subirArchivoFtp,
  eliminarArchivoFTP,
  descargarArchivoFTP,
  visualizarArchivoFTP,
  subirTarjetaContacto
} = require("../controllers/ftpController");
const uploadMiddleware = require("../middleware/fileMiddleware");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.get("/listado", obtenerListadoFtp);
router.get("/descargar", descargarArchivoFTP);
router.get("/ver-archivo", visualizarArchivoFTP);
router.post("/subir-archivo", uploadMiddleware, subirArchivoFtp); 
router.delete("/eliminar", eliminarArchivoFTP);

router.post("/subir-tarjeta-contacto", uploadMiddleware, subirTarjetaContacto)

module.exports = router;
