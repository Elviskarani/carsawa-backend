# Carsawa Backend

A RESTful API backend for a car dealership platform built with Express.js and MongoDB.

## Features

- Dealer management (registration, authentication, profile management)
- Car listing management (CRUD operations)
- Image storage using Cloudinary (migrated from AWS S3)
- MongoDB database integration
- RESTful API design
- JWT authentication
- Input validation
- Error handling
- Rate limiting

## Project Structure

```
/src
  /config        - Configuration files for DB, S3, etc.
  /controllers   - Route controllers for all endpoints
  /middleware    - Custom middleware (auth, error handling, etc.)
  /models        - Mongoose models
  /routes        - Express routes
  /utils         - Utility functions
  /services      - External services
  - app.js       - Express app setup
  - server.js    - Server initialization
```

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/car-dealership

   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=30d

   # Cloudinary (for image storage)
   CLOUDINARY_CLOUD_NAME=de40opxn4
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email (optional for password reset)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_email_password
   ```

## Running the Application

### Development

```
npm run dev
```

### Production

```
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new dealer
- `POST /api/auth/login` - Login for dealers
- `GET /api/auth/me` - Get current authenticated dealer
- `PUT /api/auth/update-profile` - Update dealer profile
- `PUT /api/auth/change-password` - Change dealer password

### Dealer Management
- `GET /api/dealers` - Get all dealers (paginated)
- `GET /api/dealers/:id` - Get dealer by ID
- `GET /api/dealers/:id/cars` - Get all cars by dealer ID

### Car Management
- `POST /api/cars` - Create new car listing
- `GET /api/cars` - Get all cars (with filtering options)
- `GET /api/cars/:id` - Get car by ID
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car
- `PUT /api/cars/:id/status` - Update car status

### Image Upload
- `POST /api/upload` - Upload images to Cloudinary
- `DELETE /api/upload/:public_id` - Delete image from Cloudinary
