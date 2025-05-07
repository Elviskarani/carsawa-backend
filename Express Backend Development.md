# Express Backend Development Guide for Car Dealership Platform

## Project Overview
Create an Express.js backend for a car dealership platform with the following capabilities:
- Dealer management (registration, authentication, profile management)
- Car listing management (CRUD operations)
- Image storage using AWS S3
- MongoDB database integration
- RESTful API design

## Database Schema (MongoDB)

### Dealer Schema
```javascript
const dealerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  profileImage: { type: String }, // S3 URL
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Car Schema
```javascript
const carSchema = new mongoose.Schema({
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
  name: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  transmission: { type: String, required: true, enum: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'] },
  engineSize: { type: String, required: true },
  condition: { type: String, required: true, enum: ['New', 'Used', 'Certified Pre-Owned'] },
  price: { type: Number, required: true },
  mileage: { type: Number, required: true },
  fuelType: { type: String, required: true, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'] },
  bodyType: { type: String, required: true, enum: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Truck'] },
  color: { type: String, required: true },
  features: [{ type: String }],
  images: [{ type: String }], // Array of S3 URLs
  status: { type: String, default: 'Available', enum: ['Available', 'Sold', 'Reserved'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new dealer
- `POST /api/auth/login` - Login for dealers
- `GET /api/auth/me` - Get current authenticated dealer
- `PUT /api/auth/update-profile` - Update dealer profile
- `PUT /api/auth/change-password` - Change dealer password
- `POST /api/auth/forgot-password` - Password reset request
- `PUT /api/auth/reset-password` - Reset password with token

### Dealer Management
- `GET /api/dealers` - Get all dealers (paginated)
- `GET /api/dealers/:id` - Get dealer by ID
- `PUT /api/dealers/:id` - Update dealer (admin only)
- `DELETE /api/dealers/:id` - Delete dealer (admin only)
- `GET /api/dealers/:id/cars` - Get all cars by dealer ID

### Car Management
- `POST /api/cars` - Create new car listing
- `GET /api/cars` - Get all cars (with filtering options)
- `GET /api/cars/:id` - Get car by ID
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car
- `PUT /api/cars/:id/status` - Update car status

### Image Upload
- `POST /api/upload` - Upload images to S3 bucket

## Implementation Requirements

### Authentication & Security
1. Use JWT for authentication
2. Hash passwords with bcrypt
3. Implement middleware for protected routes
4. Set up CORS configuration
5. Add rate limiting for API endpoints

### File Upload Requirements
1. Set up AWS S3 integration for image storage
2. Create middleware for image upload and validation
3. Support multiple image uploads (up to 10 per car)
4. Generate unique file names to prevent collisions
5. Validate file types (images only)
6. Set file size limitations

### Database Integration
1. Set up MongoDB connection with Mongoose
2. Implement proper error handling for database operations
3. Add data validation using Mongoose schemas
4. Create indexes for commonly queried fields

### API Features
1. Implement filtering, sorting, and pagination for car listings
2. Add search functionality for cars by make, model, year, etc.
3. Create robust error handling with appropriate status codes
4. Add request validation using a library like express-validator
5. Implement proper logging mechanism

## Project Structure
```
/src
  /config
    - db.js
    - s3.js
  /controllers
    - authController.js
    - dealerController.js
    - carController.js
    - uploadController.js
  /middleware
    - auth.js
    - upload.js
    - validation.js
    - errorHandler.js
  /models
    - Dealer.js
    - Car.js
  /routes
    - authRoutes.js
    - dealerRoutes.js
    - carRoutes.js
    - uploadRoutes.js
  /utils
    - helpers.js
    - constants.js
  /services
    - emailService.js
  - app.js
  - server.js
```

## Required Dependencies
```json
{
  "dependencies": {
    "aws-sdk": "^2.1499.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.4",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## Environment Variables
Create a `.env` file with the following variables:
```
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/car-dealership

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name

# Email (optional for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

## Key Implementation Details

### S3 Image Upload Configuration
```javascript
// config/s3.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG and WEBP are allowed.'), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = uniqueSuffix + path.extname(file.originalname);
      cb(null, `${req.user.id}/${fileName}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = { upload, s3 };
```

### Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const Dealer = require('../models/Dealer');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = await Dealer.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found with this ID' 
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};
```

### Car Creation Example
```javascript
// controllers/carController.js
const Car = require('../models/Car');
const { validationResult } = require('express-validator');

exports.createCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Add current dealer as the car owner
    req.body.dealer = req.user.id;
    
    // Handle image URLs from S3 upload
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.location);
    }
    
    const car = await Car.create(req.body);
    
    res.status(201).json({
      success: true,
      data: car
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
```

## Testing Strategy
1. Use Postman or Thunder Client to test all API endpoints
2. Create separate test collections for:
   - Authentication flow
   - Dealer operations
   - Car operations
   - Image uploads
3. Test error handling and validation
4. Verify S3 uploads are working correctly
5. Test pagination, filtering, and search functionality

## Deployment Considerations
1. Set up environment variables in production
2. Configure proper CORS settings for production
3. Set up MongoDB Atlas for database hosting
4. Ensure AWS S3 bucket has correct permissions
5. Implement logging with Winston or similar
6. Set up monitoring and error tracking

## Security Checklist
1. Implement proper input validation
2. Secure routes with authentication middleware
3. Set appropriate CORS settings
4. Use Helmet.js for security headers
5. Implement rate limiting
6. Sanitize user inputs to prevent NoSQL injection
7. Set secure and HTTP-only cookies
8. Handle errors without leaking sensitive information

## Next Steps After Implementation
1. Add API documentation with Swagger
2. Implement refresh tokens for better security
3. Add role-based access control
4. Set up CI/CD pipeline
5. Add unit and integration tests
