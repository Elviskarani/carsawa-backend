require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create S3 service object
const s3 = new AWS.S3();

// Function to create a bucket
const createBucket = async () => {
  try {
    console.log(`Attempting to create bucket: ${process.env.S3_BUCKET_NAME}`);
    console.log(`Region: ${process.env.AWS_REGION}`);
    
    // Create the parameters for calling createBucket
    const bucketParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      CreateBucketConfiguration: {
        LocationConstraint: process.env.AWS_REGION
      }
    };
    
    // Call S3 to create the bucket
    const data = await s3.createBucket(bucketParams).promise();
    console.log(`Success! Bucket created at: ${data.Location}`);
    
    // Set the bucket CORS policy to allow image uploads from different origins
    const corsParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"]
          }
        ]
      }
    };
    
    await s3.putBucketCors(corsParams).promise();
    console.log('CORS policy added to bucket');
    
    return data;
  } catch (error) {
    console.error('Error creating bucket:', error.message);
    if (error.code === 'BucketAlreadyOwnedByYou') {
      console.log('Bucket already exists and is owned by you.');
    } else if (error.code === 'BucketAlreadyExists') {
      console.log('Bucket name is already taken by another AWS account. Try a different name.');
    } else if (error.code === 'InvalidAccessKeyId') {
      console.error('The AWS Access Key ID you provided is invalid.');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.error('The AWS Secret Access Key you provided is invalid.');
    }
    throw error;
  }
};

// Function to test S3 connection
const testS3Connection = async () => {
  try {
    console.log('\nTesting connection to S3 bucket...');
    console.log(`Bucket name: ${process.env.S3_BUCKET_NAME}`);
    
    // List objects in the bucket
    const data = await s3.listObjects({
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 10
    }).promise();
    
    console.log('Connection successful!');
    console.log(`Found ${data.Contents.length} objects in the bucket.`);
    
    if (data.Contents.length > 0) {
      console.log('Objects in bucket:');
      data.Contents.forEach(obj => {
        console.log(` - ${obj.Key} (Size: ${obj.Size} bytes, Last modified: ${obj.LastModified})`);
      });
    } else {
      console.log('The bucket is empty.');
    }
    
    // Upload a test file to verify write permissions
    console.log('\nUploading a test file to verify write permissions...');
    const testParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'test-file.txt',
      Body: 'This is a test file to verify S3 bucket write permissions.',
      ContentType: 'text/plain'
    };
    
    const uploadResult = await s3.putObject(testParams).promise();
    console.log('Test file uploaded successfully!');
    console.log('ETag:', uploadResult.ETag);
    
    return true;
  } catch (error) {
    console.error('Error testing S3 connection:', error.message);
    
    if (error.code === 'NoSuchBucket') {
      console.error(`The bucket '${process.env.S3_BUCKET_NAME}' does not exist.`);
    } else if (error.code === 'InvalidAccessKeyId') {
      console.error('The AWS Access Key ID you provided is invalid.');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.error('The AWS Secret Access Key you provided is invalid.');
    } else if (error.code === 'NetworkingError') {
      console.error('Network error. Please check your internet connection.');
    } else if (error.code === 'AccessDenied') {
      console.error('Access denied. Check your IAM permissions for this bucket.');
    }
    
    return false;
  }
};

// Main function to run both operations
const main = async () => {
  try {
    // First create the bucket
    await createBucket();
    console.log('\n--- Bucket creation completed ---\n');
    
    // Then test the connection
    const testResult = await testS3Connection();
    if (testResult) {
      console.log('\nS3 bucket connection test completed successfully.');
    } else {
      console.log('\nS3 bucket connection test failed.');
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

// Run the main function
main();
