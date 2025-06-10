import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";

import { sendConfirmationEmail, sendDoctorNotificationEmail } from '../utils/email.js';
import { getIO } from '../socket.js';
const combineDateAndTime = (dateStr, timeStr) => {
  return new Date(`${dateStr}T${timeStr}:00`);
};


export const createBooking = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, comment } = req.body;
    const patientId = req.userId;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: "Missing required booking information (doctorId, appointmentDate, appointmentTime)" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const dateTime = combineDateAndTime(appointmentDate, appointmentTime);
    if (isNaN(dateTime.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date or time format provided." });
    }

    // Check for double booking, considering only pending or confirmed bookings
    const existingBooking = await Booking.findOne({
        doctor: doctorId,
        appointmentDateTime: dateTime,
        status: { $in: ['pending', 'confirmed'] } 
    });

    if (existingBooking) {
        return res.status(400).json({ success: false, message: "This time slot is already booked or pending confirmation." });
    }

    const bookingData = {
      doctor: doctorId,
      user: patientId,
      appointmentDateTime: dateTime,
      status: 'confirmed' // Default status, or consider 'pending' if doctor approval is needed
    };

    if (comment) {
      bookingData.comment = comment;
    }

    const newBooking = new Booking(bookingData);

    await newBooking.save();

    // Send confirmation email (fail-safe)
    try {
      const patient = await User.findById(patientId);
      const doctor = await Doctor.findById(doctorId);
      if (patient && doctor) {
        const firstName = patient.name.split(' ')[0];
        await sendConfirmationEmail(
          patient.email,
          firstName,
          doctor.name,
          appointmentDate,
          appointmentTime
        );

        // Notify doctor as well
        await sendDoctorNotificationEmail(
          doctor.email,
          patient.name,
          appointmentDate,
          appointmentTime
        );

        // Emit real-time event
        try {
          const io = getIO();
          io.to(doctorId.toString()).emit('newBooking', {
            patientName: patient.name,
            date: appointmentDate,
            time: appointmentTime,
          });
        } catch (socketErr) {
          console.error('Socket emit failed:', socketErr.message);
        }
      }
    } catch (err) {
      console.error('Failed to send email notifications:', err);
    }

    res.status(201).json({ 
      success: true, 
      message: "Appointment booked successfully!", 
      data: newBooking 
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: "Failed to book appointment. Please try again later." });
  }
};

// Update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status: newStatus } = req.body; 
    const loggedInUserId = req.userId;
    const loggedInUserRole = req.role;

    // --- 1. Validate Input --- 
    const allowedStatusUpdates = ["pending", "confirmed", "cancelled", "completed"];
    if (!newStatus || !allowedStatusUpdates.includes(newStatus)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowedStatusUpdates.join(', ')}` });
    }

    // --- 2. Find Booking --- 
    const booking = await Booking.findById(bookingId).populate('doctor', 'id name').populate('user', 'id name');
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // --- 3. Authorization & Logic --- 
    let canUpdate = false;

    if (loggedInUserRole === 'patient') {
      if (booking.user._id.toString() !== loggedInUserId) {
        return res.status(403).json({ success: false, message: "Patient: You are not authorized to update this booking." });
      }
      if (newStatus === 'cancelled' && (booking.status === 'pending' || booking.status === 'confirmed')) {
        canUpdate = true;
      } else if (newStatus !== 'cancelled') {
        return res.status(403).json({ success: false, message: "Patient: You can only cancel your bookings." });
      } else {
         return res.status(400).json({ success: false, message: `Patient: Booking cannot be cancelled. Current status: ${booking.status}.`});
      }
    } else if (loggedInUserRole === 'doctor') {
      if (booking.doctor._id.toString() !== loggedInUserId) {
        return res.status(403).json({ success: false, message: "Doctor: You are not authorized to update this booking as it's not for you." });
      }
      // Doctors can confirm pending bookings, or complete/cancel confirmed/pending ones.
      if ((newStatus === 'confirmed' && booking.status === 'pending') ||
          (newStatus === 'completed' && (booking.status === 'confirmed' || booking.status === 'pending')) ||
          (newStatus === 'cancelled' && (booking.status === 'confirmed' || booking.status === 'pending'))) {
        canUpdate = true;
      } else {
        return res.status(400).json({ success: false, message: `Doctor: Cannot change status from '${booking.status}' to '${newStatus}'.` });
      }
    } else if (loggedInUserRole === 'admin') {
      // Admins have more flexibility, but still within reason (e.g., not from completed to pending)
      if ((booking.status === 'completed' || booking.status === 'cancelled') && (newStatus === 'pending' || newStatus === 'confirmed')) {
        return res.status(400).json({ success: false, message: `Admin: Cannot revert a '${booking.status}' booking to '${newStatus}'.` });
      }
      canUpdate = true; // Admins can update status more broadly
    }

    if (!canUpdate) {
      return res.status(403).json({ success: false, message: "Update not permitted for your role or current booking status." });
    }
    
    // --- 4. Prevent Updating if already in the target state or a terminal state ---
    if (booking.status === newStatus) {
        return res.status(400).json({ success: false, message: `Booking is already ${newStatus}.` });
    }
   
    if ((loggedInUserRole === 'patient' || loggedInUserRole === 'doctor') && ['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Booking is already ${booking.status} and cannot be updated further by your role.` 
      });
    }


    // --- 5. Update Status --- 
    booking.status = newStatus;
    const updatedBooking = await booking.save();

    // TODO: Add notification logic here in a real app (e.g., email patient/doctor)

    res.status(200).json({
      success: true,
      message: `Booking status successfully updated to ${newStatus}`,
      data: updatedBooking,
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ success: false, message: "Failed to update booking status. Please try again later." });
  }
};

// New: Update prescription or doctor notes
export const addPrescriptionOrNotes = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { prescription, doctorNotes } = req.body;
    const loggedInUserId = req.userId;
    const loggedInUserRole = req.role;

    if (!prescription && !doctorNotes) {
      return res.status(400).json({ success: false, message: "Nothing to update. Provide prescription or doctorNotes." });
    }

    // Only doctors (or admin) can add/edit prescription/notes
    if (loggedInUserRole !== 'doctor' && loggedInUserRole !== 'admin') {
      return res.status(403).json({ success: false, message: "You are not authorized to perform this action." });
    }

    const booking = await Booking.findById(bookingId).populate('doctor', 'id name');
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (loggedInUserRole === 'doctor' && booking.doctor._id.toString() !== loggedInUserId) {
      return res.status(403).json({ success: false, message: "You can only update your own appointments." });
    }

    if (prescription !== undefined) booking.prescription = prescription;
    if (doctorNotes !== undefined) booking.doctorNotes = doctorNotes;

    const updatedBooking = await booking.save();

    // TODO: Email patient that prescription is available

    res.status(200).json({ success: true, message: "Booking updated successfully", data: updatedBooking });
  } catch (error) {
    console.error("Error adding prescription/notes:", error);
    res.status(500).json({ success: false, message: "Failed to update booking." });
  }
};
