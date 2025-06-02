import express from "express";
import { authenticate, restrict } from "./../auth/verifyToken.js";
import { 
  createBooking, 
  updateBookingStatus
} from "../controllers/bookingController.js";

const router = express.Router({ mergeParams: true });

// Create a new booking
router.post("/", authenticate, restrict(["patient"]), createBooking);

// Update booking status (e.g., cancel)
router.put("/:bookingId/status", authenticate, restrict(["patient", "doctor", "admin"]), updateBookingStatus);

// We previously removed the checkout route

export default router;
