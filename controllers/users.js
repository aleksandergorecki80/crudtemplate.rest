const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');
const emailData = config.get('emailData');
const host = config.get('host');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');


exports.registerUser = async (req, res, next) => {
  const { password } = req.body;
  const errors = validationResult(req);

  try {
    if(!errors.isEmpty()){
      const validationErrors = {}
      errors.array().forEach(element => {
        validationErrors[element.param] = element.msg;
      });
      console.log(validationErrors)
      return res.status(400).json({ success: false, errors: validationErrors });
    }
    // Encrypting the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = new User({ ...req.body,  password: hashedPassword });
    const user = await User.create(userData);

    res.status(200).json({
      message: 'New account created',
      data: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    // return res.status(500).send('Server error');
    next(err);
  }
};
