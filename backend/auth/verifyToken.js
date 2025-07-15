import jwt from "jsonwebtoken";
import DoctorSchema from "../models/DoctorSchema.js";
import UserSchema from "../models/UserSchema.js";

export const authenticate = async (req, res, next) => {
  // Get token from header
  const authToken = req.headers.authorization;

  // Check if token exists
  if (!authToken || !authToken.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token
    const token = authToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token has expired" });
    }

    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const restrict = roles => async (req, res, next) => {

  const userRole = req.role;

  if (!userRole) {
    return res.status(401).json({ success: false, message: "Authentication required, role not found in token." });
  }

  if (!roles.includes(userRole)) { 
    return res
      .status(403)
      .json({ success: false, message: "You're not authorized" });
  }

  next();
};


