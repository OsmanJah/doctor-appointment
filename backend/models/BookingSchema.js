import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Types.ObjectId, ref: "Doctor", required: true },
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    appointmentDateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
export default Booking;