const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
// Ensure we're using the correct environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'de40opxn4';
const apiKey = process.env.CLOUDINARY_API_KEY || '161587784173276';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'txCW0PsMPUbPBM__dVP58uienh8';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// Log configuration status (for debugging)
console.log(`Cloudinary configured with cloud_name: ${cloudName}`);

module.exports = { cloudinary };
