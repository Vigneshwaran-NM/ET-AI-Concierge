const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadMiddleware, uploadFile } = require('../controllers/uploadController');

// All routes are protected
router.use(protect);

// POST /api/upload — upload a file and get AI analysis in the active chat
router.post('/', uploadMiddleware, uploadFile);

module.exports = router;
