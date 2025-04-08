const express = require("express");
const {
  obtenerListadoFtp,
  subirArchivoFtp,
  eliminarArchivoFTP,
  descargarArchivoFTP,
  visualizarArchivoFTP
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

module.exports = router;
