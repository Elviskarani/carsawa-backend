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

// Run the function
createBucket()
  .then(() => console.log('Bucket creation process completed.'))
  .catch(() => console.log('Bucket creation failed.'));
