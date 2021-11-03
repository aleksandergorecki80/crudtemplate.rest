const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/auth');
const { check } = require('express-validator');
const expressValidationResults = require('../middleware/expressValidationResults');

router.post(
  '/register',
  check('name').notEmpty().withMessage('Username can not be null'),
  check('password').notEmpty().withMessage('Password can not be null').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  registerUser
);

router.post(
  '/login',
  check('email').notEmpty().withMessage('Email can not be null'),
  check('password').notEmpty().withMessage('Password can not be null').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  expressValidationResults,
  loginUser
);

module.exports = router;