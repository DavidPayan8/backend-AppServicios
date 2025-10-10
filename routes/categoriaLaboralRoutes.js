const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const categoriasCtrl = require('../controllers/categoriaLaboralController');

router.use(authenticateToken);


// Categorías laborales
router.get('/', categoriasCtrl.getCategorias);
router.post('/', categoriasCtrl.createCategoria);
router.put('/:id', categoriasCtrl.updateCategoria);
router.delete('/:id', categoriasCtrl.deleteCategoria);

// Tarifas
router.get('/tarifas', categoriasCtrl.getTarifas);
router.post('/tarifas', categoriasCtrl.createTarifa);
router.put('/tarifas/:id', categoriasCtrl.updateTarifa);
router.delete('/tarifas/:id', categoriasCtrl.deleteTarifa);

module.exports = router;