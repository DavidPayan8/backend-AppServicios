const express = require("express");
const {
    getAllSolicitudes,
    getById,
    create,
    update,
    deleteSolicitud
} = require("../controllers/solicitudController");
const uploadMiddleware = require("../middleware/fileMiddleware");
const authenticateToken = require("../middleware/authMiddleware");
const { authorizeModule } = require('../middleware/moduleMiddleware');
const router = express.Router();

router.use(authenticateToken);
router.use(authorizeModule("la-torre", "solicitud"));

router.get("/", getAllSolicitudes);
router.get("/:id", getById);
router.post("/", uploadMiddleware, create);
router.patch("/:id", uploadMiddleware, update);
router.delete("/", deleteSolicitud);

module.exports = router;
