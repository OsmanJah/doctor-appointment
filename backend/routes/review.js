import express from 'express';
import { createReview, getAllReviews } from '../controllers/reviewController.js';
import { authenticate, restrict } from '../auth/verifyToken.js'; // Assuming you have auth middleware

const router = express.Router({ mergeParams: true }); // mergeParams allows access to :doctorId from parent router

// Route to get all reviews (e.g., for a specific doctor if doctorId is in params, or all reviews globally)
// If this route is nested under /doctors/:doctorId/reviews, req.params.doctorId will be available.
router.get('/', getAllReviews);

// Route to create a new review for a specific doctor
// Only authenticated patients can create reviews
router.post('/', authenticate, restrict(['patient']), createReview);

export default router;
