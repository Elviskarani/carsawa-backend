const express = require('express');
const router = express.Router();
const { uploadImages, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Protected routes
router.post('/', protect, upload.array('images', 10), uploadImages);
router.delete('/:publicId', protect, deleteImage);

module.exports = router;
