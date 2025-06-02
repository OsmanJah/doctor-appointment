import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    trim: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  photo: {
    type: String,
  },
}, { timestamps: true }); // Add timestamps for creation/update times

// This checks if the model "Medicine" already exists; if so, it reuses it.
const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);
export default Medicine; 