const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  cambiarDetalleAlbaran,
  crearDetalleAlbaran,
  borrarDetalleAlbaran,
  obtenerCabeceraOt,
  obtenerDetallesDoc
} = require("../controllers/albaranController");

router.use(authenticateToken);

//Rutas para detalles doc
router.post("/obtener-detallesDoc", obtenerDetallesDoc);
router.post("/cambiar-detallesDoc", cambiarDetalleAlbaran);
router.post("/add-detallesDoc", crearDetalleAlbaran);
router.post("/borrar-detallesDoc", borrarDetalleAlbaran);

//Rutas para cabecera doc
router.post("/obtener-cabecera", obtenerCabeceraOt);
/* router.post('/crear-cabecera', cambiarDetallesAlbaran);
router.post('/borrar-cabecera', cambiarDetallesAlbaran);
 */

module.exports = router;
