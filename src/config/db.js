const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Add connection options for better stability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Log more details about the error for debugging
    if (error.name === 'MongoParseError') {
      console.error('There appears to be an issue with the MongoDB connection string format');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB servers in your connection string');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
