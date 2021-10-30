const { updateOne } = require('../models/Product');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };

  // Fields to exclude, and remove them
  const removeFields = ['select', 'sort'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create querry string and add operators
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match)=> `$${match}`);

  // Finding resources id DB 
  query = Product.find(JSON.parse(queryStr));

  // Select fields
  if(req.query.select){
    const fields = req.query.select.split(',').join(' ');
    // Selecting fields to display
    query = query.select(fields);
  }
  if(req.query.sort){
    const fields = req.query.sort.split(',').join(' ');
    // Sorting by fields
    query = query.sort(fields);
  } else {
    query = query.sort('-date');
  }

  // and exequting
  const products = await query;

  res.status(200).json({
    success: true,
    data: products,
    count: products.length,
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
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
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
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
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: product,
  });
});
