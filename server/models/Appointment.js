import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    index: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  queueNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'CheckedIn', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  date: {
    type: String,
    required: true,
    index: true,
  }
}, { timestamps: true });

// Ensure queue numbers are unique per doctor per day
appointmentSchema.index({ doctorId: 1, date: 1, queueNumber: 1 }, { unique: true });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
