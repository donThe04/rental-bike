const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId, // Đảm bảo ID này tồn tại trong bảng Car
    ref: 'Car',
    required: true
  },
  bpm: Number,
  temperature: Number,
  // Đưa latitude và longitude ra ngoài cùng cấp với carId
  latitude: Number, 
  longitude: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Telemetry', telemetrySchema);
