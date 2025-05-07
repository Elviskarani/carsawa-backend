require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Log the actual values being used
console.log('Environment variables from .env:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'undefined');

// Configure Cloudinary with hardcoded values from your .env file
// This bypasses any potential issues with environment variable loading
cloudinary.config({
  cloud_name: 'de40opxn4',
  api_key: '161587784173276',
  api_secret: 'txCW0PsMPUbPBM__dVP58uienh8'
});

// Simple test to verify Cloudinary connection
async function testCloudinaryConnection() {
  try {
    console.log('\nTesting connection with hardcoded credentials...');
    // Get account information to verify credentials
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful!');
    console.log('Response:', result);
    
    return true;
  } catch (error) {
    console.error('Cloudinary connection failed:');
    console.error(error);
    return false;
  }
}

// Run the test
testCloudinaryConnection()
  .then(success => {
    if (success) {
      console.log('\nYour Cloudinary setup is working correctly!');
    } else {
      console.log('\nPlease check your Cloudinary credentials.');
    }
  });
