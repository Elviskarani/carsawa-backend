const express = require('express');
const router = express.Router();
const { 
  getDealers, 
  getDealerById, 
  getDealerCars 
} = require('../controllers/dealerController');

// Public routes
router.get('/', getDealers);
router.get('/:id', getDealerById);
router.get('/:id/cars', getDealerCars);

module.exports = router;
