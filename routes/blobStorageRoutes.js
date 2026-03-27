const express = require("express");
const {
    subirArchivoAzure,
    eliminarArchivoAzure,
    obtenerListadoAzure,
    descargarArchivoAzure,
    visualizarArchivoAzure,
    subirTarjetaContacto,
    visualizarTarjetaContacto,
    visualizarImagenOT,
    subirTicketGasto
} = require("../controllers/blobStorageController");
const uploadMiddleware = require("../middleware/fileMiddleware");
const authenticateToken = require("../middleware/authMiddleware");
const { authorizeModule } = require('../middleware/moduleMiddleware');
const { TIPOS_DOCUMENTO } = require("../shared/tiposDocumento");
const router = express.Router();

router.use(authenticateToken);

router.get("/listado", obtenerListadoAzure);
router.get("/descargar", descargarArchivoAzure);
router.get("/ver-archivo", visualizarArchivoAzure);
router.post("/subir", uploadMiddleware, subirArchivoAzure);
router.delete("/eliminar", eliminarArchivoAzure);

router.post("/tarjeta-contacto", uploadMiddleware, subirTarjetaContacto);
router.get("/tarjeta-contacto", visualizarTarjetaContacto);

router.post("/subir-ticket-gasto",authorizeModule("portal_empleado", "nota_gasto"), uploadMiddleware, subirTicketGasto);

router.get("/img-ot",authorizeModule("servicios",), visualizarImagenOT)

module.exports = router;
