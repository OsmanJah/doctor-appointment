// backend/index.js
import 'dotenv/config';

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from 'http';
import { initSocket } from './socket.js';

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

// Create HTTP server to attach socket.io
const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
