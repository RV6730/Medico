import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  }
});

// Compound unique index
counterSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export const Counter = mongoose.model('Counter', counterSchema);
