// backend/index.js
import 'dotenv/config';

import mongoose from 'mongoose';
import { createServer } from 'http';

import app from './app.js';
import { initSocket } from './socket.js';

const port = process.env.PORT || 8000;

mongoose.set('strictQuery', false);

const httpServer = createServer(app);
initSocket(httpServer);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB database is connected');

    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('MongoDB database connection failed', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
  httpServer.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Closing server gracefully.');
  httpServer.close(() => {
    mongoose.connection
      .close(false)
      .then(() => process.exit(0))
      .catch(err => {
        console.error('Error closing MongoDB connection', err);
        process.exit(1);
      });
  });
});
