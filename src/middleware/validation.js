const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for dealer registration
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('whatsapp').notEmpty().withMessage('WhatsApp number is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.country').notEmpty().withMessage('Country is required')
];

// Validation rules for dealer login
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Validation rules for car creation
const carValidation = [
  body('name').notEmpty().withMessage('Car name is required'),
  body('make').notEmpty().withMessage('Make is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Please provide a valid year'),
  body('transmission')
    .isIn(['Automatic', 'Manual', 'CVT', 'Semi-Automatic'])
    .withMessage('Please provide a valid transmission type'),
  body('engineSize').notEmpty().withMessage('Engine size is required'),
  body('condition')
    .isIn(['New', 'Used', 'Certified Pre-Owned'])
    .withMessage('Please provide a valid condition'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('mileage').isNumeric().withMessage('Mileage must be a number'),
  body('fuelType')
    .isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'])
    .withMessage('Please provide a valid fuel type'),
  body('bodyType')
    .isIn(['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Truck'])
    .withMessage('Please provide a valid body type'),
  body('color').notEmpty().withMessage('Color is required')
];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
  carValidation
};
