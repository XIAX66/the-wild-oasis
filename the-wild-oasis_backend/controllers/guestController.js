const catchAsync = require('../utils/catchAsync');
const Guest = require('../models/guestModels');

exports.getGuests = catchAsync(async (req, res, next) => {
  const guests = await Guest.find();
  res.status(200).json({
    status: 'success',
    data: {
      guests,
    },
  });
});

exports.createGuest = catchAsync(async (req, res, next) => {
  const newGuest = await Guest.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      guest: newGuest,
    },
  });
});

exports.updateGuest = catchAsync(async (req, res, next) => {
  const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!guest) {
    return next(new AppError('No guest found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      guest,
    },
  });
});
