import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import bcrypt from "bcryptjs";


export const updateDoctor = async (req, res) => {
  const id = req.params.id;
  const loggedInDoctorId = req.userId;

  // Ensure doctors can only update their own profile
  if (loggedInDoctorId !== id) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update this profile.",
    });
  }

  const {
    name,
    phone,
    photo,
    ticketPrice,
    specialization,
    bio,
    about,
    timeSlots,
    password,
    qualifications,
    experiences,
    locations,
  } = req.body;

  const updatableFields = {};

  if (name) updatableFields.name = name;
  if (phone) updatableFields.phone = phone;
  if (photo) updatableFields.photo = photo;
  if (ticketPrice !== undefined) updatableFields.ticketPrice = parseFloat(ticketPrice) || 0;
  if (specialization) updatableFields.specialization = specialization;
  if (bio) updatableFields.bio = bio;
  if (about) updatableFields.about = about;
  // Basic validation for timeSlots structure could be added here if necessary
  if (timeSlots && Array.isArray(timeSlots)) {
    updatableFields.timeSlots = timeSlots.map(slot => ({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDurationMinutes: parseInt(slot.slotDurationMinutes, 10) || 30,
    }));
  }

  // Handle qualifications update - ensure it's an array and has required fields
  if (qualifications && Array.isArray(qualifications)) {
    updatableFields.qualifications = qualifications.map(q => ({
        degree: q.degree,
        university: q.university,
        year: q.year,
    })).filter(q => q.degree && q.university && q.year); 
  }

  // Handle experiences update - ensure it's an array and has required fields
  if (experiences && Array.isArray(experiences)) {
    updatableFields.experiences = experiences.map(exp => ({
        position: exp.position,
        hospital: exp.hospital,
        duration: exp.duration,
    })).filter(exp => exp.position && exp.hospital && exp.duration); // Basic validation
  }

  // Handle locations update - ensure it's an array of strings
  if (locations && Array.isArray(locations)) {
    updatableFields.locations = locations.map(loc => String(loc).trim()).filter(loc => loc !== '');
  }

  // Handle password update

  // Handle password update
  if (password) {
    if (password.trim() === "") {
      return res.status(400).json({ success: false, message: "Password cannot be empty." });
    }
    const salt = await bcrypt.genSalt(10);
    updatableFields.password = await bcrypt.hash(password, salt);
  }

  // DEBUG: Log locations before saving
  if (updatableFields.locations) {
    console.log("Attempting to save locations:", updatableFields.locations);
  }

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updatableFields },
      { new: true, runValidators: true } // runValidators for schema constraints
    ).select("-password"); // Exclude password from returned object

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedDoctor,
    });
  } catch (err) {
    console.error("Update Doctor Error:", err);
    if (err.name === 'ValidationError') {
        let errors = {};
        Object.keys(err.errors).forEach((key) => {
            errors[key] = err.errors[key].message;
        });
        return res.status(400).json({ success: false, message: "Validation Error", errors });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update profile. Please try again.",
    });
  }
};

// delete Doctor
export const deleteDoctor = async (req, res) => {
  const id = req.params.id;
  const loggedInDoctorId = req.userId;

  if (loggedInDoctorId !== id) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to delete this profile.",
    });
  }

  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(id);

    if (!deletedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (err) {
    console.error("Delete Doctor Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile. Please try again.",
    });
  }
};

// getSingle Doctor
export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    const doctor = await Doctor.findById(id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name photo' // Select only name and photo from the user
        }
      })
      .select("-password");

    if (!doctor) { 
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({
      success: true,
      message: "Doctor profile retrieved successfully", 
      data: doctor,
    });
  } catch (err) { // Catch for other errors (DB issues, etc.)
    console.error("Get Single Doctor Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve doctor profile", 
    });
  }
};

// getAll Doctor
export const getAllDoctor = async (req, res) => {
  try {
    const { query } = req.query;
    let doctors;

    if (query) {
      // Search based on doctor name or specialization
      doctors = await Doctor.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { specialization: { $regex: query, $options: "i" } },
        ],
      }).select("-password");
    } else {
      doctors = await Doctor.find({}).select("-password");
    }

    
    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully", 
      data: doctors,
    });
  } catch (err) { 
    console.error("Get All Doctors Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve doctors", 
    });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; 

    if (!date) {
      return res.status(400).json({ success: false, message: "Date parameter is required" });
    }

    const requestedDateObj = new Date(date + 'T00:00:00Z'); 
    if (isNaN(requestedDateObj.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date format. Please use YYYY-MM-DD." });
    }

    const doctor = await Doctor.findById(doctorId).select("timeSlots ticketPrice"); 
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    if (!doctor.timeSlots || doctor.timeSlots.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "Doctor has no available time slots defined", 
        data: { availableSlots: [], ticketPrice: doctor.ticketPrice }
      });
    }

    const dayOfWeek = requestedDateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const relevantTimeSlotsRules = doctor.timeSlots.filter(slot => slot.day === dayOfWeek);

    if (relevantTimeSlotsRules.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: `Doctor is not available on ${dayOfWeek}s`, 
        data: { availableSlots: [], ticketPrice: doctor.ticketPrice }
      });
    }

    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    const existingBookings = await Booking.find({
      doctor: doctorId,
      appointmentDateTime: { 
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ['pending', 'confirmed'] } 
    }).select("appointmentDateTime"); 

    const bookedTimeStrings = new Set();
    existingBookings.forEach(booking => {
        const bookingTime = new Date(booking.appointmentDateTime);
        const hours = String(bookingTime.getUTCHours()).padStart(2, '0');
        const minutes = String(bookingTime.getUTCMinutes()).padStart(2, '0');
        bookedTimeStrings.add(`${hours}:${minutes}`);
    });

    const availableSlots = [];

    relevantTimeSlotsRules.forEach(rule => {
      const { startTime, endTime, slotDurationMinutes } = rule;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      let currentSlotTime = new Date(requestedDateObj);
      currentSlotTime.setUTCHours(startHour, startMinute, 0, 0);

      const ruleEndTimeOnDate = new Date(requestedDateObj);
      ruleEndTimeOnDate.setUTCHours(endHour, endMinute, 0, 0);

      while (currentSlotTime < ruleEndTimeOnDate) {
        const potentialSlotHour = String(currentSlotTime.getUTCHours()).padStart(2, '0');
        const potentialSlotMinute = String(currentSlotTime.getUTCMinutes()).padStart(2, '0');
        const potentialSlotTimeString = `${potentialSlotHour}:${potentialSlotMinute}`;

        if (!bookedTimeStrings.has(potentialSlotTimeString)) {
          availableSlots.push(potentialSlotTimeString);
        }

        currentSlotTime.setUTCMinutes(currentSlotTime.getUTCMinutes() + slotDurationMinutes);
      }
    });

    res.status(200).json({
      success: true,
      message: "Available slots fetched successfully",
      data: { availableSlots, ticketPrice: doctor.ticketPrice }, 
    });

  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ success: false, message: "Failed to fetch available slots. Please try again." });
  }
};

// Get Appointments for the Logged-in Doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.userId; 

    // Retrieve bookings for this doctor
    const bookings = await Booking.find({ doctor: doctorId })
                                   .populate('user', 'name photo') 
                                   .sort({ appointmentDateTime: 1 }); 

    res.status(200).json({
      success: true,
      message: "Doctor's appointments retrieved successfully",
      data: bookings,
    });

  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve appointments." });
  }
};

export const getDoctorProfile = async (req, res) => {
  const userId = req.userId;

  try {
    // Populate the doctor's reviews so they are available on the dashboard
    const user = await Doctor.findById(userId)
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name photo',
        },
      })
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: "Doctor profile not found for the logged-in user." });
    }

    // Also load appointments with patient info for completeness
    const appointments = await Booking.find({ doctor: userId })
      .populate('user', 'name photo')
      .sort({ appointmentDateTime: 1 });

    const { password, ...rest } = user._doc; // password already excluded but keep pattern

    res.status(200).json({
      success: true,
      message: "Doctor profile retrieved successfully",
      data: { ...rest, appointments },
    });
  } catch (error) {
    console.error("Get Doctor Profile Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve doctor profile. Please try again." });
  }
};
