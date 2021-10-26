const { updateOne } = require('../models/Product');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    data: products,
    count: products.length,
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      // return res.status(400).json({ success: false });
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    // res.status(400).json({ success: false, data: error });
    // next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    next(err);
  }
};

// @desc    Crate new product
// @route   POST /api/v1/products
// @access  Private
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    // res.status(400).json({ success: false, data: error });
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    // res.status(400).json({ success: false, data: error });
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(400).json({ success: false });
  }
  try {
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    // res.status(400).json({ success: false, data: error });
    next(err);
  }
};
