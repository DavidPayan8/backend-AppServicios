const express = require("express");
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { geocodificar } = require('../controllers/geolocationController')

router.use(authenticateToken);

router.get("/geocodificar",geocodificar);


module.exports = router;
