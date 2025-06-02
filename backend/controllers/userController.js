import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";
import bcrypt from "bcryptjs"; 

// update User
export const updateUser = async (req, res) => {
  const id = req.params.id; 
  const loggedInUserId = req.userId; 
  const loggedInUserRole = req.role; 

  if (loggedInUserId !== id && loggedInUserRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update this profile.",
    });
  }

  const { name, gender, bloodType, photo, password } = req.body;
  const updatableFields = {};

  if (name) updatableFields.name = name;
  if (gender) updatableFields.gender = gender;
  if (bloodType) updatableFields.bloodType = bloodType;
  if (photo) updatableFields.photo = photo;

  // Handle password update
  if (password) {
    if (password.trim() === "") {
      return res.status(400).json({ success: false, message: "Password cannot be empty." });
    }
    const salt = await bcrypt.genSalt(10);
    updatableFields.password = await bcrypt.hash(password, salt);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: updatableFields, 
      },
      { new: true, runValidators: true } 
    ).select("-password"); 

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Update User Error:", err); 
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

// delete User
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const loggedInUserId = req.userId;
  const loggedInUserRole = req.role;

  if (loggedInUserId !== id && loggedInUserRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to delete this profile.",
    });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (err) {
    console.error("Delete User Error:", err); 
    res.status(500).json({
      success: false,
      message: "Failed to delete profile. Please try again.",
    });
  }
};

// getSingle User
export const getSingleUser = async (req, res) => {
  const id = req.params.id;
  const loggedInUserId = req.userId;
  const loggedInUserRole = req.role;

  if (loggedInUserId !== id && loggedInUserRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to view this profile.",
    });
  }

  try {
    const user = await User.findById(id).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully", 
      data: user,
    });
  } catch (err) {
    console.error("Get Single User Error:", err); 
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve user profile. Please try again.",
    });
  }
};

// getAll User
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({}).select("-password"); 

    res.status(200).json({
      success: true,
      message: "All users retrieved successfully", 
      data: users,
    });
  } catch (err) {
    console.error("Get All Users Error:", err); 
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve users. Please try again.", 
    });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Successfully ",
      data: { ...rest },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve your profile. Please try again." });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    // 1. Retrieve bookings for the specific user, excluding cancelled ones
    const bookings = await Booking.find({
      user: req.userId,
      status: { $ne: 'cancelled' } // $ne means "not equal"
    })
      .populate('doctor', 'name specialization photo') 
      .sort({ appointmentDateTime: -1 }); 

    // 2. Return the booking details
    res.status(200).json({ 
      success: true, 
      message: "Appointments retrieved successfully", 
      data: bookings 
    });

  } catch (error) {
    console.error("Error fetching user appointments:", error); 
    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments. Please try again later.",
    });
  }
};
