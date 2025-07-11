// backend/index.js
import 'dotenv/config';

import app from './app.js';

import mongoose from "mongoose";
import { createServer } from 'http';
import { initSocket } from './socket.js';










const port = process.env.PORT || 8000;















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
