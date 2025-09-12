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
  setEstadoCabecera,
  createCobro,
  borrarCobro
} = require("../controllers/albaranController");

router.use(authenticateToken);

//Rutas para cabecera doc
router.get("/obtener-cabecera", obtenerCabeceraOt);
router.post('/crear-cabecera', crearCabeceraAlbaran);
router.patch('/cambiar-estado-albaran', setEstadoCabecera);

//Rutas para detalles doc
router.get("/", obtenerDetallesDoc);
router.put("/", cambiarDetalleAlbaran);
router.post("/", crearDetalleAlbaran);
router.delete("/", borrarDetalleAlbaran);

//Rutas para cobros doc
router.post("/cobro", createCobro);
router.delete("/cobro", borrarCobro);

 

module.exports = router;
