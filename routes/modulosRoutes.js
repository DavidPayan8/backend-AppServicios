const express = require("express");
const {} = require("../controllers/modulosController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRol = require("../middleware/authorizeMiddleware");
const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRol("superadmin"));

// Módulos
router.get("/modulos", getModulos);
router.post("/modulos", createModulo);

// Submódulos
router.get("/submodulos", getSubmodulos);
router.post("/submodulos", createSubmodulo);

module.exports = router;
