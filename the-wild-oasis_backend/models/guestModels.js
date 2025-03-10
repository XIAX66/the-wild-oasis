const mongoose = require('mongoose');
const validator = require('validator');

const guestSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'A guest must have a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true, // Ensure each email is unique
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  nationality: {
    type: String,
    required: [true, 'Please provide your nationality'],
  },
  countryFlag: {
    type: String,
  },
  nationalID: {
    type: String,
  },
});

const Guest = mongoose.model('Guest', guestSchema);

module.exports = Guest;
