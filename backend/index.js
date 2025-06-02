// backend/index.js
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const envPath    = path.join(__dirname, '.env');

// Load .env once
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
} else {
}

// Only one log, after loading .env
console.log('MAIL_HOST is', process.env.MAIL_HOST);

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import authRoute     from "./routes/auth.js";
import userRoute     from "./routes/user.js";
import doctorRoute   from "./routes/doctor.js";
import medicineRoute from "./routes/medicine.js";
import checkoutRoute from "./routes/checkout.js";
import bookingRoute  from "./routes/booking.js";
import uploadRoute   from "./routes/upload.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true }));

app.use("/api/v1/auth",     authRoute);
app.use("/api/v1/users",    userRoute);
app.use("/api/v1/doctors",  doctorRoute);
app.use("/api/v1/medicines",medicineRoute);
app.use("/api/v1/checkout", checkoutRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/upload",   uploadRoute);

app.get("/", (req, res) => res.send("Hello World!"));

mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB database is connected");
  } catch (err) {
    console.error("MongoDB database connection failed", err);
  }
};

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
