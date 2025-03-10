const mongoose = require('mongoose');

const cabinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A cabin must have a name'],
    unique: true,
    trim: true,
    maxlength: [20, 'A cabin name must have less or equal then 20 characters'],
    minlength: [1, 'A cabin name must have more or equal then 1 characters'],
    // validate: [validator.isAlpha, 'Cabin name must only contain characters']
  },
  maxCapacity: {
    type: Number,
    required: [true, 'A cabin must have a capacity'],
  },
  regularPrice: {
    type: Number,
    required: [true, 'A cabin must have a regular price'],
  },
  discount: {
    type: Number,
    // validate: {
    //   validator: function (val) {
    //     // this only points to current doc on NEW document creation
    //     return val <= this.regularPrice;
    //   },
    //   message: 'Discount price ({VALUE}) should be below regular price',
    // },
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    //required: [true, 'A cabin must have an image'],
  },
});

const Cabin = mongoose.model('Cabin', cabinSchema);

module.exports = Cabin;
