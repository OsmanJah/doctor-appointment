import express from 'express';
import { uploadPhoto } from '../controllers/uploadController.js';
import upload from '../middleware/cloudinaryConfig.js'; // Use Cloudinary config

const router = express.Router();

// POST /api/v1/upload/photo
// Simple single-file upload route
router.post('/photo', upload.single('photo'), uploadPhoto);

// Global error handler for the upload routes
router.use((err, req, res, next) => {
  console.error('Upload error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected error occurred during file upload'
  });
});

export default router;
