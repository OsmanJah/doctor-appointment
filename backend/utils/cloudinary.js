import { v2 as cloudinary } from 'cloudinary';

// Get credentials from environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'duhqee1mt';
const apiKey = process.env.CLOUDINARY_API_KEY || '994591494232738';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'r7eRZVPR-rqZt4-DYQtfpFewOno';

console.log(`Cloudinary config - cloud_name: ${cloudName}, api_key: ${apiKey ? 'present' : 'missing'}, api_secret: ${apiSecret ? 'present' : 'missing'}`);

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true // Use https
});

console.log('Cloudinary initialized successfully');

export default cloudinary;