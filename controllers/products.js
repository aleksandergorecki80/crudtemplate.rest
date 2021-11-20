const { updateOne } = require('../models/Product');
const path = require('path');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/UserModel');
const config = require('config');
const MAX_FILE_UPLOAD = config.get('fileUpload.MAX_FILE_UPLOAD');
const FILE_UPLOAD_PATH = config.get('fileUpload.FILE_UPLOAD_PATH');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'comments',
    select: 'title rating'
  });
  if (!product) {
    return next(
      new ErrorResponse([`Product not found with id of ${req.params.id}`], 404)
    );
  }
  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Crate new product
// @route   POST /api/v1/products
// @access  Private
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    message: 'New product added',
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is a product owner
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorised for this request.`
      )
    );
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Product updated',
    data: updatedProduct,
  });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  // Make sure user is a product owner
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorised for this request.`
      )
    );
  }
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Product deleted',
    data: {}
  });
});

// @desc    Upload pfoto for product
// @route   PUT /api/v1/products/:id/photo
// @access  Private
exports.productPhotoUpload = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product with id ${req.params.id} not found`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a photo`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload a image file`, 400));
  }

  // Check filesize
  if (file.size > parseInt(MAX_FILE_UPLOAD, 10)) {
    return next(new ErrorResponse(`The image file must be less than 1MB`, 400));
  }

  // Crate custom filename
  file.name = `photo_${product._id}_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(`${FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`File upload failed`, 500));
    }

    const photosUpdated = [...product.photos, file.name];

    const productUpdated = await Product.findByIdAndUpdate(
      req.params.id,
      { photos: photosUpdated },
      { returnOriginal: false }
    );
    res.status(200).json({
      success: true,
      message: 'Photo uploated',
      data: productUpdated,
    });
  });
});
