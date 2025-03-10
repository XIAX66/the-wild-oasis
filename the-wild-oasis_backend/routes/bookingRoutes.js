const express = require('express');
const {
  getBookings,
  getBookingById,
  updateBooking,
  createBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.route('/').get(protect, getBookings).post(protect, createBooking);
router
  .route('/:id')
  .get(protect, getBookingById)
  .patch(protect, updateBooking)
  .delete(protect, deleteBooking);

module.exports = router;
