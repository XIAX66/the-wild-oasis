const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('../models/bookingModels');

dotenv.config({ path: './config.env' });

// declare DB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB)
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  });

const booking = JSON.parse(
  fs.readFileSync(`${__dirname}/bookings-simple.json`, 'utf-8'),
);

const importData = async () => {
  try {
    await Booking.create(booking);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Booking.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
