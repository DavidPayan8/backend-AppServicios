const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  cambiarDetalleAlbaran,
  crearDetalleAlbaran,
  borrarDetalleAlbaran,
  obtenerCabeceraOt,
  obtenerDetallesDoc,
  crearCabeceraAlbaran,
  setEstadoCabecera
} = require("../controllers/albaranController");

router.use(authenticateToken);

//Rutas para detalles doc
router.get("/obtener-detallesDoc", obtenerDetallesDoc);
router.put("/cambiar-detallesDoc", cambiarDetalleAlbaran);
router.post("/add-detallesDoc", crearDetalleAlbaran);
router.delete("/borrar-detallesDoc", borrarDetalleAlbaran);

//Rutas para cabecera doc
router.get("/obtener-cabecera", obtenerCabeceraOt);
router.post('/crear-cabecera', crearCabeceraAlbaran);
router.patch('/cambiar-estado-albaran', setEstadoCabecera);
 

module.exports = router;
