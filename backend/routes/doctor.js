import {
  // adminAuth, // Keep commented or remove if not used elsewhere
  authenticate,
  // doctorAuth, // To be removed
  restrict,
} from "../auth/verifyToken.js";
import {
  deleteDoctor,
  getAllDoctor,
  getDoctorProfile,
  getSingleDoctor,
  updateDoctor,
  getAvailableSlots,
  getDoctorAppointments,
} from "../controllers/doctorController.js";
import express from "express";
// import { createReview } from "../controllers/reviewController.js";

const router = express.Router();

// Get doctor's own appointments (schedule)
router.get("/profile/appointments", authenticate, restrict(["doctor"]), getDoctorAppointments);

// get all doctors
router.get("/", getAllDoctor);
router.get("/:id", getSingleDoctor);

// Add route for available slots
router.get("/:doctorId/available-slots", authenticate, getAvailableSlots);

router.put("/:id", authenticate, restrict(["doctor"]), updateDoctor);
router.delete("/:id", authenticate, restrict(["doctor"]), deleteDoctor);
router.get("/profile/me", authenticate, restrict(["doctor"]), getDoctorProfile);

export default router;
