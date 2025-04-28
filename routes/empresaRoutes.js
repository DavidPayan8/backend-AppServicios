const express = require('express');
const { getEmpresa, getColorPrincipal,updateEmpresa } = require('../controllers/empresaController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getEmpresa);
router.put('/', updateEmpresa);
router.get('/color-principal', getColorPrincipal)

module.exports = router;