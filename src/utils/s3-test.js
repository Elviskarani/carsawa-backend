require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create S3 service object
const s3 = new AWS.S3();

// Test function to check a specific bucket
const checkBucket = async () => {
  try {
    console.log('Testing AWS S3 connection...');
    console.log(`Using bucket: ${process.env.S3_BUCKET_NAME}`);
    console.log(`Region: ${process.env.AWS_REGION}`);
    
    // Instead of listing all buckets, check if we can access the specific bucket
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 1 // Just check if we can list at least one object
    };
    
    const data = await s3.listObjectsV2(params).promise();
    console.log('Connection successful!');
    console.log(`Successfully connected to bucket: ${process.env.S3_BUCKET_NAME}`);
    
    // Show some info about the bucket contents
    console.log(`The bucket contains ${data.KeyCount} objects.`);
    if (data.KeyCount > 0) {
      console.log('Sample objects:');
      data.Contents.forEach(object => {
        console.log(`- ${object.Key} (${Math.round(object.Size / 1024)} KB)`);
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error connecting to AWS S3:', error.message);
    if (error.code === 'InvalidAccessKeyId') {
      console.error('The AWS Access Key ID you provided is invalid.');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.error('The AWS Secret Access Key you provided is invalid.');
    } else if (error.code === 'NetworkingError') {
      console.error('Network error. Please check your internet connection.');
    }
    throw error;
  }
};

// Run the test
checkBucket()
  .then(() => console.log('S3 test completed.'))
  .catch(() => console.log('S3 test failed.'));
