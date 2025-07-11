import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach, jest } from '@jest/globals';

// Increase timeout for starting/stopping MongoMemoryServer
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'testsecret';
jest.setTimeout(30000);

// Mock email utilities globally for all tests to avoid hitting real SMTP or Mailtrap limits
jest.mock('./utils/email.js', () => ({
  sendConfirmationEmail: jest.fn().mockResolvedValue(),
  sendDoctorNotificationEmail: jest.fn().mockResolvedValue(),
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
