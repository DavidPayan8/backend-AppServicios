const express = require("express");
const {
    subirArchivoAzure,
    eliminarArchivoAzure,
    obtenerListadoAzure,
    descargarArchivoAzure,
    visualizarArchivoAzure,
    subirTarjetaContacto,
    visualizarTarjetaContacto,
    visualizarImagenOT
} = require("../controllers/blobStorageController");
const uploadMiddleware = require("../middleware/fileMiddleware");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.get("/listado", obtenerListadoAzure);
router.get("/descargar", descargarArchivoAzure);
router.get("/ver-archivo", visualizarArchivoAzure);
router.post("/subir", uploadMiddleware, subirArchivoAzure);
router.delete("/eliminar", eliminarArchivoAzure);

router.post("/tarjeta-contacto", uploadMiddleware, subirTarjetaContacto);
router.get("/tarjeta-contacto", visualizarTarjetaContacto);

router.get("/img-ot", visualizarImagenOT)

module.exports = router;
