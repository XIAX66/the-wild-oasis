const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mogoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const cabinRouter = require('./routes/cabinRoutes');
const userRouter = require('./routes/userRoutes');
const settingRouter = require('./routes/settingRoutes');
const imageRouter = require('./routes/imageRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const guestRouter = require('./routes/guestRoutes');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const app = express();

// 1) GLOBAL MIDDLEWARES

// Serving static files
app.use(fileUpload());

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit requests from same API
const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: 'Too mamy requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mogoSanitize());

// Data sanitization against XSS
app.use(xss());

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : 'https://生产域名.com',
  credentials: true,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.set('Cross-Origin-Resource-Policy', 'cross-origin'); // 允许跨域访问
  next();
});

// // Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsQuantity',
//       'ratingsAverage',
//       'maxGroupSize',
//       'difficulty',
//       'price',
//     ],
//   }),
// );

// 2) ROUTE HANDLERS

// 3) ROUTE
app.use('/api/v1/cabins', cabinRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/settings', settingRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/guests', guestRouter);
app.use('/images', imageRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global err handling middleware
app.use(globalErrorHandler);

module.exports = app;
