const express = require('express');
const {
  getSettings,
  updateSetting,
  createSetting,
} = require('../controllers/settingController');

const router = express.Router();

router.route('/').get(getSettings).post(createSetting);
router.route('/:id').patch(updateSetting);

module.exports = router;
