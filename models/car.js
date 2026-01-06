const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  model: { type: String, required: true },
  brand: { type: String, required: false },
  year: { type: Number, required: false },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  borrowTime: { type: Date },
  station: { type: Boolean, default: false }, // Thêm trường để đánh dấu trạm
});

module.exports = mongoose.model('Car', carSchema);
