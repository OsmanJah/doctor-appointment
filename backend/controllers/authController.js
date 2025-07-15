import User from "../models/UserSchema.js";
import bcrypt from "bcryptjs";
import Doctor from "../models/DoctorSchema.js";
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  const { name, email, password, role, photo, gender, specialization } = req.body;

  try {
    let existingUser = null;

    if (role === "patient") {
      existingUser = await User.findOne({ email });
    } else if (role === "doctor") {
      existingUser = await Doctor.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    
    let user = null;
    let formattedName = name;
    
    if (role === "doctor") {
      formattedName = formattedName.replace(/^\s*(dr\.?\s*)/i, "");
      formattedName = `Dr. ${formattedName}`;
    }

    if (role === "patient") {
      user = new User({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    } else if (role === "doctor") {
      user = new Doctor({
        name: formattedName,
        email,
        password: hashPassword,
        photo,
        role: "doctor",
        specialization: specialization || "General Practice",
      });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    await user.save();

    res
      .status(201)
      .json({ success: true, message: "user successfully created" });
  } catch (err) {
    console.error("--- Error during user registration/save: ---");
    console.error(err);
    console.error("---------------------------------------------");
    res
      .status(500)
      .json({ success: false, message: "Internal server error! Try again" });
  }
};

export const login = async (req, res) => {
  const { email } = req.body;

  try {
    let user = null;
    const patient = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });

    if (patient) {
      user = patient;
    } else if (doctor) {
      user = doctor;
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    }

    const { password, role, appointments, ...rest } = user._doc;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    res.status(200).json({
      success: true,
      message: "Successfully login",
      token,
      data: { ...rest },
      role,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to login" });
  }
};
