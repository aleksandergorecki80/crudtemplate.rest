const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/UserModel');
const config = require('config');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const emailData = config.get('emailData');
const host = config.get('host');
const jwtCookieExpire = parseInt(config.get('jwtCookieExpire'), 10);

const nodemailer = require('nodemailer');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public

exports.registerUser = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  // Validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let validationErrors = [];
    errors.array().forEach((element) => {
      validationErrors = [...validationErrors, element.msg];
    });
    return next(new ErrorResponse(validationErrors, 404));
  }

  // Encrypting the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userData = new User({ ...req.body, password: hashedPassword });
  const user = await User.create(userData);

  // Create token
  const token = user.getSignedJwtToken();
  res.status(200).json({
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
    message: 'User data fetched',
    data: {
      user
    }
  })
}); 


// @desc    Forgot password
// @route   GET /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if(!user) return next(new ErrorResponse('There is no user with that email', 404));

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  console.log(resetToken)

  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    message: 'User data fetched',
    data: {
      user
    }
  })
}); 


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + jwtCookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if(process.env.NODE_ENV === 'production'){
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