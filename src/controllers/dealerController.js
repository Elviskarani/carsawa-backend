const Dealer = require('../models/Dealer');
const Car = require('../models/Car');

// @desc    Get all dealers (paginated)
// @route   GET /api/dealers
// @access  Public
const getDealers = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    
    const count = await Dealer.countDocuments();
    
    const dealers = await Dealer.find({})
      .select('-password')
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      dealers,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dealer by ID
// @route   GET /api/dealers/:id
// @access  Public
const getDealerById = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.params.id).select('-password');
    
    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }
    
    res.json(dealer);
  } catch (error) {
    console.error(error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Dealer not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all cars by dealer ID
// @route   GET /api/dealers/:id/cars
// @access  Public
const getDealerCars = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    
    // Build filter object
    const filter = { dealer: req.params.id };
    
    // Add status filter (default to Available if not specified)
    filter.status = req.query.status || 'Available';
    
    const count = await Car.countDocuments(filter);
    
    const cars = await Car.find(filter)
      .sort({ createdAt: -1 })
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
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Dealer not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDealers,
  getDealerById,
  getDealerCars
};
