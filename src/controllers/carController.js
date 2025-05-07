const Car = require('../models/Car');

// @desc    Create a new car listing
// @route   POST /api/cars
// @access  Private
const createCar = async (req, res) => {
  try {
    // Add the dealer ID from the authenticated user
    req.body.dealer = req.dealer._id;
    
    const car = await Car.create(req.body);
    
    res.status(201).json(car);
  } catch (error) {
    console.error(error);
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
  updateCarStatus
};
