const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  minBookingLength: {
    type: Number,
    required: [true, 'A setting must have a minimum booking length'],
  },
  maxBookingLength: {
    type: Number,
    required: [true, 'A setting must have a maximum booking length'],
  },
  maxGuestsPerBooking: {
    type: Number,
    required: [true, 'A setting must have a maximum guests per booking'],
  },
  breakfastPrice: {
    type: Number,
    required: [true, 'A setting must have a breakfast price'],
  },
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
