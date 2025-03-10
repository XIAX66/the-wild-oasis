const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const sendEmail = require('../utils/email');
// const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSessionAndSend = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // httpOnly: true, // 禁止前端 JS 读取
    secure: process.env.NODE_ENV === 'production', // 仅 HTTPS 传输
    sameSite: 'Strict', // 防止 CSRF 攻击
  };

  user.password = undefined;

  const session = {
    access_token: token,
    expires_at:
      Math.floor(Date.now() / 1000) +
      process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60,
    expires_in: process.env.JWT_EXPIRES_IN,
    token_type: 'Bearer',
    user,
  };

  res.cookie('session', session, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    session,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSessionAndSend(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1. check if email & password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password'), 400);
  }
  // 2. check if user exists & password correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3. If everything ok, send token to client
  createSessionAndSend(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting tolen and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('Your are not logged in! Please log in to get access', 401),
    );
  //console.log(token);

  // 2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to this token does no longer exist.'),
    );
  //console.log(currentUser);

  // GRAND ACCESS TO PROTECT ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

// exports.forgetPassword = catchAsync(async (req, res, next) => {
//   // 1. Get user basedd on POSTed email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) next(new AppError('There is no user with mail address', 404));

//   // 2. Genarate the random reset token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   // 3. Send it to user's email
//   const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
//   const message = `Forgot your password? Submit a PATCH request with your new password and password Confirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Your password reset token (valid for 10 min)',
//       message,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'Token sent to email',
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError('There was an error sending the mail.Try again later!', 500),
//     );
//   }
// });

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   // 1. get user based on the token
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');

//   console.log(req.params.token, hashedToken);

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   // 2. If token has not expired, and there is user, set the new password
//   if (!user) return next(new AppError('Token is invalid or has expired', 400));
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();

//   // 3. Update changedPasswordAt property for the user

//   // 4. Log the user in, send JWT
//   createSessionAndSend(user, 200, res);
// });

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   // 1. Get user from collection
//   const user = await User.findById(req.user.id).select('+password');

//   // 2. Check if POSTed current password is correct
//   if (!user.correctPassword(req.body.passwordCurrent, user.password))
//     return next(new AppError('Password is not correct! Please check again.'));

//   // 3. If so, update password
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save();
//   // User.findByIdAndUpdate will NOT work as intended!

//   // 4. Log user in, send JWT
//   createSessionAndSend(user, 200, res);
// });
