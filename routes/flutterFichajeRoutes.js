const express = require("express");
const router = express.Router();
const flutterApiKeyMiddleware = require("../middleware/flutterApiKeyMiddleware");
const flutterRateLimitMiddleware = require("../middleware/flutterRateLimitMiddleware");
const {
  ficharFlutterHandler,
} = require("../controllers/flutterFichajeController");

// Apply middlewares in order: API Key validation -> Rate limiting
router.use(flutterApiKeyMiddleware);
router.use(flutterRateLimitMiddleware);

// POST /fichar - Automatic check-in/check-out
router.post("/fichar", ficharFlutterHandler);

module.exports = router;
