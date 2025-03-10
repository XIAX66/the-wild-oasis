const mongoose = require('mongoose');
const Cabin = require('./cabinModels');

const bookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: [true, 'A booking must have a start date'],
    validate: {
      validator: function (value) {
        return this.endDate > value;
      },
      message: 'End date must be after start date',
    },
  },
  endDate: {
    type: Date,
    required: [true, 'A booking must have an end date'],
  },
  numNights: {
    type: Number,
    default: 0, // 将通过 pre-save 钩子计算
  },
  numGuests: {
    type: Number,
    required: [true, 'A booking must have a number of guests'],
  },
  cabinPrice: {
    type: Number,
    min: 0, // 防止负价格
  },
  extrasPrice: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    min: 0,
  },
  status: {
    type: String,
    enum: ['unconfirmed', 'checked-in', 'checked-out'],
    default: 'unconfirmed',
  },
  hasBreakfast: {
    type: Boolean,
    default: false,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  observations: {
    type: String,
  },
  cabinId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cabin',
    required: [true, 'A booking must belong to a cabin'],
  },
  guestId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Guest',
    required: [true, 'A booking must belong to a guest'],
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

// ================== 价格计算逻辑 ==================
bookingSchema.pre('save', async function (next) {
  // 1. 计算附加费用
  this.extrasPrice = this.hasBreakfast ? 20 : 0;

  // 2. 获取关联舱室价格（带异常处理）
  try {
    const cabin = await mongoose.model('Cabin').findById(this.cabinId);
    if (!cabin) throw new Error('关联舱室不存在');

    // 3. 计算舱室净价（考虑折扣下限）
    const discount = cabin.discount > cabin.regularPrice ? 0 : cabin.discount;
    this.cabinPrice = cabin.regularPrice - discount;

    // 4. 计算总价
    this.totalPrice = this.cabinPrice + this.extrasPrice;
  } catch (err) {
    return next(err);
  }

  // 计算入住天数（包含当天）
  const timeDiff = this.endDate - this.startDate;
  this.numNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // 计算附加费用
  this.extrasPrice = this.hasBreakfast ? 20 : 0;

  // 自动更新状态
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'unconfirmed';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'checked-in';
  } else {
    this.status = 'checked-out';
  }

  next();
});

// ================== 状态更新触发器 ==================
bookingSchema.post(['save', 'findOneAndUpdate'], async function (doc) {
  // 当日期被修改时自动重新计算状态
  const now = new Date();
  if (doc.isModified('startDate') || doc.isModified('endDate')) {
    if (
      now >= doc.startDate &&
      now <= doc.endDate &&
      doc.status !== 'checked-in'
    ) {
      doc.status = 'checked-in';
      await doc.save();
    }
  }
});

// ================== 查询助手 ==================
// 添加按状态过滤的查询方法
bookingSchema.query.byStatus = function (status) {
  return this.where('status').equals(status);
};

// ================== 虚拟字段 ==================
// 获取剩余天数（用于前端显示）
bookingSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  if (now < this.startDate) {
    const diff = this.startDate - now;
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
  return 0;
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
