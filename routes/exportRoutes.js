const express = require("express");
const {
    exportExcel
} = require("../controllers/exportController");
const authenticateToken = require("../middleware/authMiddleware");
const { authorizeModule } = require('../middleware/moduleMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.post("/excel", authorizeModule("panel_gestion", "listado_fichaje"), exportExcel);


module.exports = router;