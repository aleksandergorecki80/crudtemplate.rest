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
    return next(new ErrorResponse([`No review found.`], 404));
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
        new ErrorResponse([`No product found with the id: ${req.params.productId}`], 404)
      );
    };

    const comment = await Comment.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Comment added',
        data: comment
    })
});

// @desc    Update a comment
// @route   PUT /api/v1/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if(!comment){
    return next(new ErrorResponse([`Comment with id: ${req.params.userId} does not exist`], 404));
  }

   // Make sure comment belong to user or user is admin
  if(comment.user.toString() !== req.user.id &&  req.user.role !== 'administrator'){
    return next(new ErrorResponse([`Access denied`], 401));
  }

  const updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    message: 'Comment updated',
    data: updatedComment
  })
}); 

// @desc    Delete a comment
// @route   DELETE   /api/v1/comments/:id
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if(!comment){
    return next(new ErrorResponse([`Comment with id: ${req.params.userId} does not exist`], 404));
  }

   // Make sure comment belong to user or user is admin
  if(comment.user.toString() !== req.user.id &&  req.user.role !== 'administrator'){
    return next(new ErrorResponse([`Access denied`], 401));
  }

  await comment.remove()

  res.status(200).json({
    success: true,
    message: 'Comment deleted',
    data: {}
  })
}); 