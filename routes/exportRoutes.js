const express = require("express");
const {
    exportExcel
} = require("../controllers/exportController");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.post("/excel", exportExcel);


module.exports = router;