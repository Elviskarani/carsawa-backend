const Car = require('../models/Car');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure cloudinary storage for this specific endpoint
const carImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'carsawa/cars',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `${uniqueSuffix}${path.parse(file.originalname).name}`;
    }
  }
});

// Create multer upload instance for car images
const uploadCarImages = multer({
  storage: carImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
    files: 10 // Maximum 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).array('images', 10);

// @desc    Create a new car listing with images
// @route   POST /api/cars
// @access  Private
const createCar = async (req, res) => {
  try {
    // Handle file uploads first
    uploadCarImages(req, res, async (err) => {
      if (err) {
        console.error('Image upload error:', err);
        return res.status(400).json({ message: err.message || 'Error uploading images' });
      }
      
      try {
        // Parse car details from the form data
        const carData = req.body;
        
        // Add the dealer ID from the authenticated user
        carData.dealer = req.dealer._id;
        
        // Process uploaded images if any
        if (req.files && req.files.length > 0) {
          // Extract URLs from the uploaded files
          carData.images = req.files.map(file => ({
            url: file.path,
            publicId: file.filename
          }));
          
          // Extract just the URLs for storage in the car model
          carData.images = carData.images.map(img => img.url);
        } else {
          // Initialize as empty array if no images were uploaded
          carData.images = [];
          
          // If images were provided as URLs in the request body, validate and use them
          if (carData.imageUrls && Array.isArray(carData.imageUrls)) {
            const validImages = carData.imageUrls.filter(url => 
              typeof url === 'string' && 
              (url.startsWith('http://') || url.startsWith('https://'))
            );
            carData.images = validImages;
            delete carData.imageUrls; // Remove the imageUrls field
          }
        }
        
        // Create the car with all data
        const car = await Car.create(carData);
        
        res.status(201).json(car);
      } catch (error) {
        console.error('Car creation error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
  } catch (error) {
    console.error('Outer error in createCar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all cars with filtering, sorting, and pagination
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    
    // Build filter object
    const filter = {};
    
    // Add filters based on query parameters
    if (req.query.make) filter.make = req.query.make;
    if (req.query.model) filter.model = req.query.model;
    if (req.query.dealer) filter.dealer = req.query.dealer;
    if (req.query.condition) filter.condition = req.query.condition;
    if (req.query.transmission) filter.transmission = req.query.transmission;
    if (req.query.bodyType) filter.bodyType = req.query.bodyType;
    if (req.query.fuelType) filter.fuelType = req.query.fuelType;
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }
    
    // Year range filter
    if (req.query.minYear || req.query.maxYear) {
      filter.year = {};
      if (req.query.minYear) filter.year.$gte = Number(req.query.minYear);
      if (req.query.maxYear) filter.year.$lte = Number(req.query.maxYear);
    }
    
    // Status filter (default to Available if not specified)
    filter.status = req.query.status || 'Available';
    
    // Build sort object
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') 
        ? req.query.sort.substring(1) 
        : req.query.sort;
      
      const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      // Default sort by createdAt in descending order
      sort = { createdAt: -1 };
    }
    
    const count = await Car.countDocuments(filter);
    
    const cars = await Car.find(filter)
      .populate('dealer', 'name email phone location')
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      cars,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get car by ID
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('dealer', 'name email phone location');
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.json(car);
  } catch (error) {
    console.error(error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private
const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if the car belongs to the logged in dealer
    if (car.dealer.toString() !== req.dealer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this car' });
    }
    
    // Handle images array if present in the update
    if (req.body.images && Array.isArray(req.body.images)) {
      // Validate that images is an array of URL strings
      const validImages = req.body.images.filter(url => 
        typeof url === 'string' && 
        (url.startsWith('http://') || url.startsWith('https://'))
      );
      req.body.images = validImages;
    }
    
    // Update car with new data
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if the car belongs to the logged in dealer
    if (car.dealer.toString() !== req.dealer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this car' });
    }
    
    await car.deleteOne();
    
    res.json({ message: 'Car removed' });
  } catch (error) {
    console.error(error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update car status
// @route   PUT /api/cars/:id/status
// @access  Private
const updateCarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Available', 'Sold', 'Reserved'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status' });
    }
    
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if the car belongs to the logged in dealer
    if (car.dealer.toString() !== req.dealer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this car' });
    }
    
    car.status = status;
    const updatedCar = await car.save();
    
    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  updateCarStatus,
  uploadCarImages // Export the upload middleware for route usage
};
