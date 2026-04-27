const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const uploadPdfMiddleware = require('../middleware/uploadPdfMiddleware'); // middleware de pdfs
const { uploadPdfs } = require('../controllers/nominasController'); //  controlador de nominas
const { authorizeModule } = require('../middleware/moduleMiddleware');

router.use(authenticateToken);
router.use(authorizeModule("portal_empleado", "nominas"));
router.use(uploadPdfMiddleware);

// Ruta POST para múltiples PDFs (campo 'pdfs' en frontend)
router.post('/upload', uploadPdfs);

module.exports = router;