const express = require('express');
const { enviarEmails } = require('../controllers/emailController');
const authenticateToken = require('../middleware/authMiddleware');
const validateEmail = require('../middleware/emailMiddleware')
const router = express.Router();

router.use(authenticateToken);
router.use(validateEmail);

router.post('/enviar-email', enviarEmails);

module.exports = router