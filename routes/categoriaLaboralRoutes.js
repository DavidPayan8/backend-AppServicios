const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const categoriasCtrl = require('../controllers/categoriaLaboralController');
const { authorizeModule } = require('../middleware/moduleMiddleware');

router.use(authenticateToken);


// Categorías laborales
router.get('/',authorizeModule("panel_gestion", "categoria_laboral_panel"), categoriasCtrl.getCategorias);
router.post('/',authorizeModule("panel_gestion", "categoria_laboral_panel"), categoriasCtrl.createCategoria);
router.put('/:id',authorizeModule("panel_gestion", "categoria_laboral_panel"), categoriasCtrl.updateCategoria);
router.delete('/:id',authorizeModule("panel_gestion", "categoria_laboral_panel"), categoriasCtrl.deleteCategoria);

// Tarifas
router.get('/tarifas',authorizeModule("panel_gestion", "categoria_laboral_panel"), categoriasCtrl.getTarifas);
router.post('/tarifas',authorizeModule("panel_gestion", "categoria_laboral_panel"), categoriasCtrl.createTarifa);
router.put('/tarifas/:id',authorizeModule("panel_gestion", "categoria_laboral_panel"), categoriasCtrl.updateTarifa);
router.delete('/tarifas/:id',authorizeModule("panel_gestion", "categoria_laboral_panel"), categoriasCtrl.deleteTarifa);

module.exports = router;