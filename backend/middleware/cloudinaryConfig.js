import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';
import path from 'path';
import fs from 'fs';

// Create fallback local storage directory if needed
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created local upload directory: ${uploadDir}`);
  } catch (err) {
    console.error(`Failed to create upload directory: ${err.message}`);
  }
}

// Configure Cloudinary storage with detailed error handling
let storage;
try {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'doctor-appointment',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
  });
  console.log('Cloudinary storage successfully configured');
} catch (err) {
  console.error('Error configuring Cloudinary storage:', err);
  // Create fallback disk storage
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  console.log('Falling back to local disk storage');
}

// Configure multer with appropriate limits and error handling
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error(`File upload only supports the following filetypes: ${filetypes}`));
  }
});

// Export the configured multer middleware
export default upload;
