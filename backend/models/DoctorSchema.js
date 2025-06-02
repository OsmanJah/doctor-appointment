import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String },
  ticketPrice: { type: Number },
  role: { type: String, default: 'doctor', enum: ['doctor'] },

  // Fields for doctors only
  specialization: { type: String },
  bio: { type: String, maxLength: 100 },
  about: { type: String },
  timeSlots: { type: Array },
  qualifications: {
    type: [
      {
        degree: { type: String, required: true },
        university: { type: String, required: true },
        year: { type: String, required: true }, // Year of completion/award
      },
    ],
    default: []
  },
  experiences: [
    {
      position: { type: String }, // Made optional
      hospital: { type: String }, // Made optional
      duration: { type: String }, // Made optional
    },
  ],
});

// This checks if the model "Doctor" already exists; if so, it reuses it.
const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
export default Doctor;