import mongoose from "mongoose";
import Doctor from "./DoctorSchema.js";

const reviewSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewText: {
      type: String,
      required: false,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

// Static method to calculate average ratings and save it on the Doctor model
reviewSchema.statics.calculateAverageRatings = async function (doctorId) {
  const stats = await this.aggregate([
    {
      $match: { doctor: doctorId },
    },
    {
      $group: {
        _id: '$doctor',
        ratingQuantity: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Doctor.findByIdAndUpdate(doctorId, {
      totalRating: stats[0].ratingQuantity, // Renaming for clarity, this is the count
      averageRating: stats[0].averageRating.toFixed(1), // Keep one decimal place
    });
  } else {
    // If no reviews, reset to defaults
    await Doctor.findByIdAndUpdate(doctorId, {
      totalRating: 0,
      averageRating: 0,
    });
  }
};

// Call calculateAverageRatings after save
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRatings(this.doctor);
});

// Call calculateAverageRatings when a review is updated or deleted (findByIdAndUpdate, findByIdAndDelete)
// Mongoose middleware for findOneAndUpdate and findOneAndDelete
reviewSchema.post(/^findOneAnd/, async function(doc, next) {
  if (doc) {
    await doc.constructor.calculateAverageRatings(doc.doctor);
  }
  next();
});


const Review = mongoose.model("Review", reviewSchema);
export default Review;
