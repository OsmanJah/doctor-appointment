import express from "express";
import { authenticate, restrict } from "./../auth/verifyToken.js";
import { 
  createBooking, 
  updateBookingStatus,
  addPrescriptionOrNotes
} from "../controllers/bookingController.js";

const router = express.Router({ mergeParams: true });

// Create a new booking
router.post("/", authenticate, restrict(["patient"]), createBooking);

// Update booking status (e.g., cancel)
router.put("/:bookingId/status", authenticate, restrict(["patient", "doctor", "admin"]), updateBookingStatus);

// Add prescription or doctor notes
router.put("/:bookingId/prescription", authenticate, restrict(["doctor", "admin"]), addPrescriptionOrNotes);

// We previously removed the checkout route

export default router;
