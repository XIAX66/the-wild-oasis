const express = require('express');
const {
  getGuests,
  updateGuest,
  createGuest,
} = require('../controllers/guestController');

const router = express.Router();

router.route('/').get(getGuests).post(createGuest);
router.route('/:id').patch(updateGuest);

module.exports = router;
