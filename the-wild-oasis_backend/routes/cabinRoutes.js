const express = require('express');
const {
  getAllCabins,
  getCabin,
  createCabin,
  updateCabin,
  deleteCabin,
  uploadImage,
} = require('../controllers/cabinController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.route('/').get(protect, getAllCabins).post(
  uploadImage, // 再处理图片上传
  createCabin, // 最后创建记录
);
router
  .route('/:id')
  .get(protect, getCabin)
  .put(uploadImage, updateCabin)
  .delete(protect, deleteCabin);

module.exports = router;
