// Script to normalize doctor names in the database
// This removes the "Dr " prefix from all doctor names to avoid duplication
// Run with: node scripts/normalize-doctor-names.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name for current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

// Load environment variables
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Loaded environment variables from:', envPath);
} else {
  console.error('Error: .env file not found at:', envPath);
  process.exit(1);
}

// Define doctor schema (simplified version of what's in your model)
const doctorSchema = new mongoose.Schema({
  name: String,
  // other fields excluded for brevity
});

// Create a model
const Doctor = mongoose.model('Doctor', doctorSchema);

async function normalizeNames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Find all doctors with names starting with 'Dr '
    const doctors = await Doctor.find({ name: /^Dr\s+/i });
    
    console.log(`Found ${doctors.length} doctor records with 'Dr ' prefix`);
    
    // Process each doctor record
    for (const doctor of doctors) {
      const originalName = doctor.name;
      const cleanName = doctor.name.replace(/^Dr\.?\s+/i, '');
      
      // Update the record
      await Doctor.updateOne(
        { _id: doctor._id },
        { $set: { name: cleanName } }
      );
      
      console.log(`Updated: "${originalName}" → "${cleanName}"`);
    }
    
    console.log('✅ All doctor names normalized successfully');
  } catch (error) {
    console.error('Error normalizing doctor names:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the normalization
normalizeNames();
