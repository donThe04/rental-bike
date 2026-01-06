const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  rentalStart: { type: Date, required: false },
  rentalEnd: { type: Date, required: false },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  totalPrice: { type: Number, default: 0 }, // Tổng tiền thuê
});

module.exports = mongoose.model('Rental', rentalSchema);
