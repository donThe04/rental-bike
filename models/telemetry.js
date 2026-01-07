const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  bpm: Number,
  temperature: Number,
  location: {
    latitude: Number,
    longitude: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Telemetry', telemetrySchema);
