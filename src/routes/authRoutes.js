const express = require('express');
const router = express.Router();
const { 
  registerDealer, 
  loginDealer, 
  getDealerProfile, 
  updateDealerProfile, 
  changePassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
  registerValidation, 
  loginValidation, 
  validateRequest 
} = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, validateRequest, registerDealer);
router.post('/login', loginValidation, validateRequest, loginDealer);

// Protected routes
router.get('/me', protect, getDealerProfile);
router.put('/update-profile', protect, updateDealerProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
