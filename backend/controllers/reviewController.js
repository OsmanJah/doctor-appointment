import Review from '../models/ReviewSchema.js';
import Doctor from '../models/DoctorSchema.js';
import mongoose from 'mongoose';

// Get all reviews (can be filtered by doctor later if needed)
export const getAllReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // If doctorId is provided, filter by doctor
    let query = {};
    if (doctorId) {
      // Validate doctorId
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid doctor ID.',
        });
      }
      
      // Check if doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found.',
        });
      }
      
      query.doctor = doctorId;
    }

    const reviews = await Review.find(query)
      .populate('user', 'name photo')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      message: 'Successfully fetched reviews',
      data: reviews,
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: err.message,
    });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  const doctorId = req.params.doctorId;
  const userId = req.userId; // Assuming userId is set by auth middleware

  try {
    const { rating, reviewText } = req.body;

    // Validate rating
    if (rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required.',
      });
    }

    // Check if rating is a valid number
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5 || numRating % 1 !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a whole number between 1 and 5.',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Check if the user has already reviewed this doctor
    const existingReview = await Review.findOne({ doctor: doctorId, user: userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this doctor.',
      });
    }

    const newReview = new Review({
      doctor: doctorId,
      user: userId,
      reviewText: reviewText || '',
      rating: numRating,
    });

    const savedReview = await newReview.save();

    // Update doctor's reviews array
    await Doctor.findByIdAndUpdate(doctorId, {
      $push: { reviews: savedReview._id },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: savedReview,
    });
  } catch (err) {
    console.error('Error creating review:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + Object.values(err.errors).map(e => e.message).join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit review.',
      error: err.message,
    });
  }
};
