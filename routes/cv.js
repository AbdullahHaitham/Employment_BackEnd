const express = require('express');
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadCV } = require("../controllers/cvcontroller");
const { analyzeCV } = require("../controllers/analyzeCVController");

// CV Upload
router.post('/upload', auth, upload.single('cv'), uploadCV);

// CV Analysis
router.post('/analyze', auth, analyzeCV);

module.exports = router;
