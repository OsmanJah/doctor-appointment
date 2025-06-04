import Review from '../models/ReviewSchema.js';
import Doctor from '../models/DoctorSchema.js';

// Get all reviews (can be filtered by doctor later if needed)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).populate('user', 'name photo'); // Populate user details

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

  if (!req.body.reviewText || req.body.rating == null) {
    return res.status(400).json({
      success: false,
      message: 'Review text and rating are required.',
    });
  }

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Check if the user has already reviewed this doctor (optional, but good practice)
    // const existingReview = await Review.findOne({ doctor: doctorId, user: userId });
    // if (existingReview) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'You have already reviewed this doctor.',
    //   });
    // }

    const newReview = new Review({
      doctor: doctorId,
      user: userId,
      reviewText: req.body.reviewText,
      rating: Number(req.body.rating),
    });

    const savedReview = await newReview.save();

    // The static method on ReviewSchema will handle updating the doctor's averageRating and totalRating
    // and the reviews array on the doctor model.
    // We also need to explicitly add the review's ID to the doctor's reviews array.
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
    res.status(500).json({
      success: false,
      message: 'Failed to submit review.',
      error: err.message,
    });
  }
};
