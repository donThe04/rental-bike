const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  rfid: { type: String,  unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  token: { type: String }  
});

module.exports = mongoose.model('User', userSchema);
