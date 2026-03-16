const express = require("express");
const router = express.Router();
const flutterApiKeyMiddleware = require("../middleware/flutterApiKeyMiddleware");
const flutterRateLimitMiddleware = require("../middleware/flutterRateLimitMiddleware");
const {
  ficharFlutterHandler,
  isAdminHandler,
} = require("../controllers/flutterFichajeController");

// Apply middlewares in order: API Key validation -> Rate limiting
router.use(flutterApiKeyMiddleware);
router.use(flutterRateLimitMiddleware);

// POST /fichar - Automatic check-in/check-out
router.post("/fichar", ficharFlutterHandler);

// POST /isAdmin - Check if user is admin
router.post("/isAdmin", isAdminHandler);

module.exports = router;
