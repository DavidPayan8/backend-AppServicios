const express = require('express');
const router = express.Router();
const uploadPdfMiddleware = require('../middleware/uploadPdfMiddleware'); // middleware de pdfs
const { uploadPdfs } = require('../controllers/nominasController'); //  controlador de nominas
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(uploadPdfMiddleware);

// Ruta POST para múltiples PDFs (campo 'pdfs' en frontend)
router.post('/upload', uploadPdfs);

module.exports = router;