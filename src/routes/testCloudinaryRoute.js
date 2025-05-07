const express = require('express');
const router = express.Router();
const { cloudinary } = require('../config/cloudinary');
const { upload } = require('../middleware/upload');

// Test route for Cloudinary upload
router.post('/test-upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return file information
    res.status(200).json({
      message: 'File uploaded successfully to Cloudinary',
      file: {
        originalName: req.file.originalname,
        publicId: req.file.filename,
        url: req.file.path,
        secureUrl: req.file.path.replace('http://', 'https://'),
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test route to verify Cloudinary connection
router.get('/test-connection', async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.status(200).json({
      message: 'Cloudinary connection successful',
      result
    });
  } catch (error) {
    console.error('Cloudinary connection error:', error);
    res.status(500).json({ message: 'Cloudinary connection failed', error: error.message });
  }
});

module.exports = router;
