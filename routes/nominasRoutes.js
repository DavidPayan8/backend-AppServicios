const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const uploadPdfMiddleware = require('../middleware/uploadPdfMiddleware'); // middleware de pdfs
const { uploadPdfs } = require('../controllers/nominasController'); //  controlador de nominas

// No estaba usando el autenticador del token, que es el que guarda la sesion con los datos necesarios
router.use(authenticateToken)
router.use(uploadPdfMiddleware);

router.post('/upload', uploadPdfs);

module.exports = router;