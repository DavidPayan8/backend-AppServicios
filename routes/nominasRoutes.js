const express = require('express');
const router = express.Router();
const uploadPdfMiddleware = require('../middleware/uploadPdfMiddleware'); // middleware de pdfs
const { uploadPdfs } = require('../controllers/nominasController'); //  controlador de nominas

// Ruta POST para múltiples PDFs (campo 'pdfs' en frontend)
router.post('/upload', uploadPdfMiddleware, uploadPdfs);

module.exports = router;