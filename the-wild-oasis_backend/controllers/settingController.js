const catchAsync = require('../utils/catchAsync');
const Setting = require('../models/settingModels');

exports.getSettings = catchAsync(async (req, res, next) => {
  const settings = await Setting.find();
  res.status(200).json({
    status: 'success',
    data: {
      settings,
    },
  });
});

exports.createSetting = catchAsync(async (req, res, next) => {
  const newSetting = await Setting.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      setting: newSetting,
    },
  });
});

exports.updateSetting = catchAsync(async (req, res, next) => {
  const setting = await Setting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!setting) {
    return next(new AppError('No setting found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      setting,
    },
  });
});
