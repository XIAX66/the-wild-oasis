const Cabin = require('../models/cabinModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getGridFS } = require('../utils/gridfs');

exports.uploadImage = catchAsync(async (req, res, next) => {
  if (!req.files?.image) return next();
  const file = req.files.image;

  let gfs = getGridFS();

  // 创建可写流
  const writeStream = gfs.openUploadStream(file.name);

  // 写入文件内容
  writeStream.end(file.data);

  // 等待上传完成
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  // 更新请求体中的image字段
  req.body.image = `http://localhost:3000/images/${writeStream.id}`;
  next();
});

exports.aliasTopCabins = (req, res, next) => {
  req.query.limit = '5';
  //req.query.sort = '-ratingsAverage';
  //req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllCabins = catchAsync(async (req, res, next) => {
  const cabins = await Cabin.find();

  res.status(200).json({
    status: 'success',
    result: cabins.length,
    data: {
      cabins,
    },
  });
});

exports.getCabin = catchAsync(async (req, res, next) => {
  const cabin = await Cabin.findById(req.params.id);

  if (!cabin) {
    return next(new AppError('No cabin found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cabin,
    },
  });
});

exports.createCabin = catchAsync(async (req, res, next) => {
  const newCabin = await Cabin.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      cabin: newCabin,
    },
  });
});

exports.updateCabin = catchAsync(async (req, res, next) => {
  const cabin = await Cabin.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!cabin) {
    return next(new AppError('No cabin found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cabin,
    },
  });
});

exports.deleteCabin = catchAsync(async (req, res, next) => {
  const cabin = await Cabin.findByIdAndDelete(req.params.id);

  if (!cabin) {
    return next(new AppError('No cabin found with that Id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// exports.getCabinStats = catchAsync(async (req, res, next) => {
//   const stats = await Cabin.aggregate([
//     { $match: { ratingsAverage: { $gte: 4.5 } } },
//     {
//       $group: {
//         _id: { $toUpper: '$difficulty' },
//         numCabins: { $sum: 1 },
//         numRatings: { $sum: '$ratingsQuantity' },
//         avgRating: { $avg: '$ratingsAverage' },
//         avgPrice: { $avg: '$price' },
//         minPrice: { $min: '$price' },
//         maxPrice: { $max: '$price' },
//       },
//     },
//     {
//       $sort: { avgPrice: 1 },
//     },
//     {
//       $match: { _id: { $ne: 'EASY' } },
//     },
//   ]);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       stats,
//     },
//   });
// });

// exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
//   const year = req.params.year * 1;

//   const plan = await Cabin.aggregate([
//     {
//       $unwind: '$startDates',
//     },
//     {
//       $match: {
//         startDates: {
//           $gte: new Date(`${year}-01-01`),
//           $lte: new Date(`${year}-12-31`),
//         },
//       },
//     },
//     {
//       $group: {
//         _id: { $month: '$startDates' },
//         numCabinStates: { $sum: 1 },
//         cabins: { $push: '$name' },
//       },
//     },
//     {
//       $addFields: { month: '$_id' },
//     },
//     {
//       $project: {
//         _id: 0,
//       },
//     },
//     {
//       $sort: { numCabinStates: -1 },
//     },
//     {
//       $limit: 12,
//     },
//   ]);

//   res.status(200).json({
//     status: 'success',
//     results: plan.length,
//     data: {
//       plan,
//     },
//   });
// });
