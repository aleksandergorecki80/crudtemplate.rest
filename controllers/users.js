const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/UserModel');
const Product = require('../models/Product');

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    // Create token
    res.status(200).json(res.advancedResults);
});


// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getSingleUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('+password');;
  if(!user){
    return next(new ErrorResponse(`User with id: ${req.params.userId} does not exist`));
  }
  res.status(200).json({
    success: true,
    data: user
  })
});

// @desc    Create user
// @route   POST /api/v1/users/
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    message: `New user ${user.name} has been created`,
    body: user
  })

});

// @desc    Update user
// @route   PUT /api/v1/users/:userId
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: `User data ${user.name} has been updated`,
    data: user
  })
});


// @desc    Delete user by id
// @route   DELETE /api/v1/users/:userId
// @access  Private/Admin
exports.deleteUser = asyncHandler( async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if(!user){
     return next(new ErrorResponse(`User with id: ${req.params.userId} does not exist`));
    }
    user.remove();
    res.status(200).json({ 
      message: `User with id: ${req.params.userId} removed.`,
      data: {}
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