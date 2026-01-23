const express = require("express");
const {
  subscribe,
  sendPush,
  reassign,
  deactivate,
} = require("../controllers/pushBrowserController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.post("/subscribe", subscribe);
router.post("/reassign", reassign);
router.post("/deactivate", deactivate);
router.post("/send", sendPush);

module.exports = router;
