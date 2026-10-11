import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  qualifications: {
    type: String,
    default: 'MBBS, MD',
  },
  experience: {
    type: String,
    required: true,
  },
  hospitalId: {
    type: String,
    required: true,
  },
  hospital: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    default: '1.2 km',
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  reviews: {
    type: Number,
    default: 120,
  },
  availableToday: {
    type: Boolean,
    default: true,
  },
  consultationFee: {
    type: Number,
    required: true,
  },
  capabilities: [{
    type: String,
  }],
  canHandleSurgery: {
    type: Boolean,
    default: false,
  },
  queue: [{
    type: mongoose.Schema.Types.Mixed,
  }],
  currentPatient: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  onBreak: {
    type: Boolean,
    default: false,
  },
  breakUntil: {
    type: Date,
    default: null,
  },
  nextSlot: {
    type: String,
    default: '10:30 AM',
  },
  bio: {
    type: String,
    default: '',
  }
}, { timestamps: true });

export const Doctor = mongoose.model('Doctor', doctorSchema);
