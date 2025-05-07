const Dealer = require('../models/Dealer');
const { generateToken } = require('../middleware/auth');

// @desc    Register a new dealer
// @route   POST /api/auth/register
// @access  Public
const registerDealer = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if dealer already exists
    const dealerExists = await Dealer.findOne({ email });

    if (dealerExists) {
      return res.status(400).json({ message: 'Dealer already exists' });
    }

    // Create new dealer
    const dealer = await Dealer.create(req.body);

    if (dealer) {
      res.status(201).json({
        _id: dealer._id,
        name: dealer.name,
        email: dealer.email,
        phone: dealer.phone,
        whatsapp: dealer.whatsapp,
        location: dealer.location,
        profileImage: dealer.profileImage,
        token: generateToken(dealer._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid dealer data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login dealer
// @route   POST /api/auth/login
// @access  Public
const loginDealer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find dealer by email
    const dealer = await Dealer.findOne({ email });

    if (!dealer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await dealer.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: dealer._id,
      name: dealer.name,
      email: dealer.email,
      phone: dealer.phone,
      whatsapp: dealer.whatsapp,
      location: dealer.location,
      profileImage: dealer.profileImage,
      token: generateToken(dealer._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current dealer profile
// @route   GET /api/auth/me
// @access  Private
const getDealerProfile = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.dealer._id).select('-password');
    
    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }
    
    res.json(dealer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update dealer profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateDealerProfile = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.dealer._id);
    
    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }
    
    // Update fields
    dealer.name = req.body.name || dealer.name;
    dealer.email = req.body.email || dealer.email;
    dealer.phone = req.body.phone || dealer.phone;
    dealer.whatsapp = req.body.whatsapp || dealer.whatsapp;
    
    if (req.body.location) {
      dealer.location = {
        ...dealer.location,
        ...req.body.location
      };
    }
    
    if (req.body.profileImage) {
      dealer.profileImage = req.body.profileImage;
    }
    
    // If password is provided, it will be hashed by the pre-save hook
    if (req.body.password) {
      dealer.password = req.body.password;
    }
    
    const updatedDealer = await dealer.save();
    
    res.json({
      _id: updatedDealer._id,
      name: updatedDealer.name,
      email: updatedDealer.email,
      phone: updatedDealer.phone,
      whatsapp: updatedDealer.whatsapp,
      location: updatedDealer.location,
      profileImage: updatedDealer.profileImage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change dealer password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    const dealer = await Dealer.findById(req.dealer._id);
    
    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }
    
    // Check if current password is correct
    const isMatch = await dealer.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Set new password
    dealer.password = newPassword;
    await dealer.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerDealer,
  loginDealer,
  getDealerProfile,
  updateDealerProfile,
  changePassword
};
