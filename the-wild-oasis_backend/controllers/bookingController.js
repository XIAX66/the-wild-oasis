const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModels');
const mongoose = require('mongoose');

const PAGE_SIZE = +process.env.PAGE_SIZE || 10;

exports.getBookings = catchAsync(async (req, res, next) => {
  const pipeline = [
    {
      $lookup: {
        from: 'cabins', // 关联舱室集合
        localField: 'cabinId',
        foreignField: '_id',
        as: 'cabinInfo',
      },
    },
    {
      $lookup: {
        from: 'guests', // 关联客人集合
        localField: 'guestId',
        foreignField: '_id',
        as: 'guestInfo',
      },
    },
    { $unwind: '$cabinInfo' }, // 展开舱室信息
    { $unwind: '$guestInfo' }, // 展开客人信息
    {
      $project: {
        _id: 1,
        startDate: 1,
        endDate: 1,
        numNights: 1,
        numGuests: 1,
        status: 1,
        totalPrice: 1,
        created_at: 1,
        'cabinInfo.name': 1,
        'guestInfo.fullName': 1,
        'guestInfo.email': 1,
      },
    },
    {
      $project: {
        cabin: '$cabinInfo.name',
        guest: {
          fullName: '$guestInfo.fullName',
          email: '$guestInfo.email',
        },
        _id: 1,
        created_at: 1,
        startDate: 1,
        endDate: 1,
        numNights: 1,
        numGuests: 1,
        status: 1,
        totalPrice: 1,
      },
    },
  ];

  if (req.query.last || req.query.lastStays) {
    const lastDays = parseInt(req.query.last || req.query.lastStays, 10);

    // 参数校验
    if (isNaN(lastDays) || lastDays <= 0) {
      return next(new Error('last 必须为大于0的数字'));
    }

    // 计算起始时间（含当天零点）
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lastDays);
    startDate.setHours(0, 0, 0, 0); // 关键：清除时分秒

    // 添加时间过滤（直接插入管道最前端）
    if (req.query.last) {
      pipeline.push({
        $match: {
          created_at: { $gte: startDate },
        },
      });
    } else {
      pipeline.push({
        $match: {
          startDate: { $gte: startDate },
        },
      });
    }
  }

  if (req.query.status) {
    pipeline.unshift({
      $match: {
        status: req.query.status, // 精确匹配状态
      },
    });
  }

  // 状态过滤（保持原有逻辑）
  if (req.query.status) {
    pipeline.unshift({ $match: { status: req.query.status } });
  }

  // 排序处理（新增逻辑）
  if (req.query.sortBy) {
    const [field, direction] = req.query.sortBy.split('-');
    const sortOrder = direction === 'asc' ? 1 : -1;

    // 根据字段类型决定排序阶段位置
    if (field === 'startDate') {
      // 基础字段在计算前排序（提升性能）
      pipeline.push({
        $sort: { [field]: sortOrder },
      });
    } else if (field === 'totalPrice') {
      // 计算字段必须在生成该字段的阶段之后排序
      const totalPriceStageIndex = pipeline.findIndex(
        (stage) => stage.$addFields?.totalPrice,
      );

      // 在生成totalPrice的阶段后插入排序
      if (totalPriceStageIndex > -1) {
        pipeline.splice(totalPriceStageIndex + 1, 0, {
          $sort: { totalPrice: sortOrder },
        });
      }
    }
  }

  // 分页处理
  let isPaginated = false;
  if (req.query.page) {
    isPaginated = true;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || PAGE_SIZE;
    const skip = (page - 1) * limit;

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    });

    pipeline.push({
      $project: {
        bookings: '$data',
        total: { $arrayElemAt: ['$total.count', 0] },
        page: { $literal: page },
        limit: { $literal: limit },
      },
    });
  }

  // 统一执行聚合查询
  const result = await Booking.aggregate(pipeline);

  // 处理响应
  if (isPaginated) {
    const responseData = result[0] || { bookings: [], total: 0 };
    return res.status(200).json({
      status: 'success',
      data: {
        ...responseData,
        totalPages: Math.ceil(
          responseData.total / (req.query.limit || PAGE_SIZE),
        ),
        // 格式化日期
        bookings: responseData.bookings.map((b) => ({
          ...b,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          created_at: b.created_at.toISOString(),
        })),
      },
    });
  }

  // 非分页响应
  res.status(200).json({
    status: 'success',
    data: {
      bookings: result.map((b) => ({
        ...b,
        startDate: b.startDate.toISOString(),
        endDate: b.endDate.toISOString(),
        created_at: b.created_at.toISOString(),
      })),
    },
  });
});

exports.getBookingById = catchAsync(async (req, res, next) => {
  const booking = await Booking.aggregate([
    // 1. 匹配指定ID的预订
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },

    // 2. 关联舱室信息
    {
      $lookup: {
        from: 'cabins',
        localField: 'cabinId',
        foreignField: '_id',
        as: 'cabinInfo',
      },
    },

    // 3. 关联客人信息
    {
      $lookup: {
        from: 'guests',
        localField: 'guestId',
        foreignField: '_id',
        as: 'guestInfo',
      },
    },

    // 4. 展开关联结果（保留空值防止数据丢失）
    { $unwind: { path: '$cabinInfo', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$guestInfo', preserveNullAndEmptyArrays: true } },

    // 5. 计算字段
    {
      $addFields: {
        numNights: {
          $divide: [
            { $subtract: ['$endDate', '$startDate'] },
            1000 * 60 * 60 * 24, // 转换为天数
          ],
        },
      },
    },
    {
      $addFields: {
        extrasPrice: {
          $ifNull: ['$extrasPrice', 0],
        },
      },
    },
    {
      $addFields: {
        cabinPrice: {
          $multiply: [
            { $subtract: ['$cabinInfo.regularPrice', '$cabinInfo.discount'] },
            '$numNights',
          ],
        },
      },
    },
    {
      $addFields: {
        totalPrice: {
          $ifNull: [{ $add: ['$cabinPrice', '$extrasPrice'] }, 0],
        },
      },
    },

    // 6. 字段投影
    {
      $project: {
        _id: 1,
        created_at: 1,
        startDate: 1,
        endDate: 1,
        numNights: 1,
        numGuests: 1,
        status: 1,
        extrasPrice: 1,
        cabinPrice: 1,
        totalPrice: 1,
        hasBreakfast: 1,
        observations: 1,
        isPaid: 1,
        cabin: '$cabinInfo.name',
        guest: {
          fullName: '$guestInfo.fullName',
          email: '$guestInfo.email',
          nationality: '$guestInfo.nationality',
          countryFlag: '$guestInfo.countryFlag',
          nationalID: '$guestInfo.nationalID',
        },
      },
    },
  ]);

  // 处理查询结果
  if (!booking || booking.length === 0) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // 格式化日期字段
  const formattedBooking = {
    ...booking[0],
    startDate: booking[0].startDate.toISOString(),
    endDate: booking[0].endDate.toISOString(),
    created_at: booking[0].created_at.toISOString(),
  };

  res.status(200).json({
    status: 'success',
    data: {
      booking: formattedBooking,
    },
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const newBooking = await Booking.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      booking: newBooking,
    },
  });
});

exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!booking) {
    return next(new AppError('No booking found with that Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that Id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
