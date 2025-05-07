const { cloudinary } = require('../config/cloudinary');

// @desc    Upload images to Cloudinary
// @route   POST /api/upload
// @access  Private
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    // Map the uploaded files to their Cloudinary URLs
    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      publicId: file.filename, // Cloudinary public ID
      url: file.path, // Cloudinary URL
      secureUrl: file.path.replace('http://', 'https://'),
      mimetype: file.mimetype,
      size: file.size
    }));
    
    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Image public ID is required' });
    }
    
    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadImages,
  deleteImage
};
