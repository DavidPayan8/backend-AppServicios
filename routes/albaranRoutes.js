const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { cambiarDetalleAlbaran, crearDetalleAlbaran, borrarDetalleAlbaran } = require('../controllers/albaranController');

router.use(authenticateToken);

//Rutas para detalles doc
router.post('/cambiar-detallesDoc', cambiarDetalleAlbaran);
router.post('/crear-detallesDoc', crearDetalleAlbaran);
router.post('/borrar-detallesDoc', borrarDetalleAlbaran);

//Rutas para cabecera doc
/* router.post('/cambiar-cabecera', cambiarDetallesAlbaran);
router.post('/crear-cabecera', cambiarDetallesAlbaran);
router.post('/borrar-cabecera', cambiarDetallesAlbaran); */


module.exports = router;