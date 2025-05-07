const express = require('express');
const router = express.Router();
const { 
  createCar, 
  getCars, 
  getCarById, 
  updateCar, 
  deleteCar, 
  updateCarStatus 
} = require('../controllers/carController');
const { protect } = require('../middleware/auth');
const { carValidation, validateRequest } = require('../middleware/validation');

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);

// Protected routes
router.post('/', protect, carValidation, validateRequest, createCar);
router.put('/:id', protect, updateCar);
router.delete('/:id', protect, deleteCar);
router.put('/:id/status', protect, updateCarStatus);

module.exports = router;
