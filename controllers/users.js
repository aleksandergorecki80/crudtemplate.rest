const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/UserModel');
const Product = require('../models/Product');

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin

exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
  
    // Create token
    res.status(200).json({
      message: 'Get users',
      count: users.length,
      data: {
        users,
      }
    });
  });

// @desc    Get products belong to user
// @route   GET /api/v1/users/:userId/products
// @access  Public
exports.getUserProducts = asyncHandler(async (req, res, next) => { 
    let query;
    if(req.params.userId){
        query = Product.find( { user: req.params.userId });
    } else {
        query = Product.find();
    }
    const courses = await query;

    res.status(200).json({
        message: `Get courses for single user ${req.params.userId}`,
        data: courses,
        count: courses.length
    })
}); 