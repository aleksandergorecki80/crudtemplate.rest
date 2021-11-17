const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Comment = require('../models/Comment');
const Product = require('../models/Product');

// @desc    Get all comments
// @route   GET /api/v1/products/:productId/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  if (req.params.productId) {
    const comments = await Comment.find({ product: req.params.productId });
    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get a single comment
// @route   GET /api/v1/comments/:id
// @access  Public
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id)
    .populate({
        path: 'product',
        select: 'title',
    })
    .populate({
        path: 'user',
        select: 'name'
    })
    ;
  if (!comment) {
    return next(new ErrorResponse(`No review found.`, 404));
  }
  res.status(200).json({
    success: true,
    data: comment,
  });
});


// @desc    Add a comment
// @route   POST /api/v1/products/:productId/comments/
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
    req.body.product = req.params.productId;
    req.body.user = req.user.id

    const product = await Product.findById(req.params.productId);

    if(!product){
      return next(
        new ErrorResponse(`No product found with the id: ${req.params.productId}, 404`)
      );
    };

    const comment = await Comment.create(req.body);

    res.status(201).json({
        success: true,
        data: comment
    })
})