const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/UserModel');
const config = require('config');

const jwtCookieExpire = parseInt(config.get('jwtCookieExpire'), 10);
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  // // Encrypting the password

  const userData = new User({ ...req.body });
  const user = await User.create(userData);

  // Create token
  const token = user.getSignedJwtToken();
  res.status(200).json({
    success: true,
    message: 'New account created',
    data: {
      name: user.name,
      email: user.email,
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );
  if (!user) return next(new ErrorResponse([`Wrong email or password`], 401));

  const isMatch = await user.matchPassword(req.body.password);
  if (!isMatch)
    return next(new ErrorResponse([`Wrong email or password`], 401));

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    message: 'User data fetched',
    data: {
      user,
    },
  });
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout 
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out',
    data: {}
  })
});



// @desc    Update user details
// @route   GET /api/v1/auth/me
// @access  Private
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'User data updated',
    data: user,
  });
});

// @desc    Update user password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) return next(new ErrorResponse('Password is incorrect', 401));

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new ErrorResponse('There is no user with that email', 404));

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const text = `You are recieving this email because you (or someone else) has requested the reset of a password. 
  Please fallow the link below. \n\n ${resetUrl}`;

  const html = `<p>You are recieving this email because you (or someone else) has requested the reset of a password. 
  Please fallow the link below. \n\n <a href=${resetUrl}>${resetUrl}</a><p>`

  try {
    await sendEmail({
      receiverEmail: user.email,
      subject: 'Password reset link',
      text,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Reset password email sent',
    data: {
      email: user.email,
      text,
      html
    },
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) return next(new ErrorResponse('Invalid token.', 400));

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + jwtCookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      message: 'User logged in succesfully',
      data: {
        name: user.name,
        email: user.email,
        token,
      },
    });
};
