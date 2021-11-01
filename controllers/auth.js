const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/UserModel');
const config = require('config');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');



const emailData = config.get('emailData');
const host = config.get('host');

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
      token
    },
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  
  const user = await User.findOne({ email: req.body.email });
  if(!user) return next( new ErrorResponse([`Wrong email or password`], 404));


    // Create token
    const token = user.getSignedJwtToken();

  res.status(200).json({
    message: 'User logged in succesfully',
    data: {
      name: user.name,
      email: user.email,
      // token
    }
  });
})