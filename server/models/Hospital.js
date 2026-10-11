import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'Multi-Specialty',
  },
  area: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    default: 'Bengaluru',
  },
  address: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    default: '1.5 km',
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  emergencyHelpline: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  reviewsCount: {
    type: Number,
    default: 850,
  },
  totalBeds: {
    type: Number,
    default: 350,
  },
  icuAvailable: {
    type: Number,
    default: 18,
  },
  ambulanceAvailable: {
    type: Boolean,
    default: true,
  },
  hasAmbulance: {
    type: Boolean,
    default: true,
  },
  ambulancePhone: {
    type: String,
    required: true,
  },
  ambulanceFleet: {
    type: Number,
    default: 5,
  },
  avgResponseTime: {
    type: String,
    default: '8-10 mins',
  },
  receptionPhone: {
    type: String,
    default: '',
  },
  facilities: [{
    type: String,
  }],
  departments: [{
    type: String,
  }],
  bannerColor: {
    type: String,
    default: 'rgba(108, 99, 255, 0.15)',
  }
}, { timestamps: true });

export const Hospital = mongoose.model('Hospital', hospitalSchema);
