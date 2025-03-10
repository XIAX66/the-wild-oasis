const fs = require('fs');
const mongoose = require('mongoose');
const { add } = require('date-fns');
const { bookings } = require('./data-bookings.js'); // 需先调整原文件结构
const dotenv = require('dotenv');
const Guest = require('../models/guestModels');
const Cabin = require('../models/cabinModels');

dotenv.config({ path: './config.env' });

// declare DB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// 1. 连接 MongoDB
mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB)
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  });

// 3. 读取本地数据
const cabins = JSON.parse(
  fs.readFileSync(`${__dirname}/cabins-simple.json`, 'utf-8'),
);
const guests = JSON.parse(
  fs.readFileSync(`${__dirname}/guests-simple.json`, 'utf-8'),
);

// 4. 创建异步转换函数
async function convertBookings() {
  // 创建映射关系
  const cabinIdMap = new Map();
  const guestIdMap = new Map();

  // 处理小木屋映射
  for (const [index, cabin] of cabins.entries()) {
    const dbCabin = await Cabin.findOne({ name: cabin.name }).lean();
    if (!dbCabin) throw new Error(`Cabin ${cabin.name} not found`);
    cabinIdMap.set(index + 1, dbCabin._id); // 假设原数据中cabinId从1开始对应数组索引
  }

  // 处理客人映射
  for (const [index, guest] of guests.entries()) {
    const dbGuest = await Guest.findOne({ email: guest.email }).lean();
    if (!dbGuest) throw new Error(`Guest ${guest.email} not found`);
    guestIdMap.set(index + 1, dbGuest._id); // 假设原数据中guestId从1开始对应数组索引
  }

  // 转换预订数据
  const converted = bookings.map((booking) => ({
    ...booking,
    cabinId: cabinIdMap.get(booking.cabinId),
    guestId: guestIdMap.get(booking.guestId),
    created_at: new Date(booking.created_at),
    startDate: new Date(booking.startDate),
    endDate: new Date(booking.endDate),
  }));

  // 保存结果
  fs.writeFileSync(
    './converted-bookings.json',
    JSON.stringify(converted, null, 2),
  );

  console.log('Conversion completed!');
  mongoose.disconnect();
}

// 执行转换
convertBookings().catch(console.error);
