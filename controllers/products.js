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
  const reqQuery = { ...req.query };

  // Fields to exclude, and remove them
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // console.log(req.params, '<=== params')
  // console.log(req.query, '<=== req.query');
  // console.log(reqQuery, '<=== reqQuery');
  console.log(req.params.userId, '<=== req.params.userId');

  // Create querry string and add operators
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  console.log(queryStr, '< === queryStr');

  // Finding resources id DB
  let query;
  if (req.params.userId) {
    query = Product.find({
      $and: [{ user: req.params.userId }, JSON.parse(queryStr)],
    });
  } else {
    query = Product.find(JSON.parse(queryStr)).populate({
      path: 'user',
      select: 'name role -_id',
    });
  }

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    console.log(fields);
    // Selecting fields to display
    query = query.select(fields);
  }
  if (req.query.sort) {
    const fields = req.query.sort.split(',').join(' ');
    // Sorting by fields
    query = query.sort(fields);
  } else {
    query = query.sort('-date');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 55;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // console.log(query, '<= query')

  // Exequting query
  const products = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  res.status(200).json({
    success: true,
    data: products,
    count: products.length,
    pagination: pagination,
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
  // Add user to req.body
  req.body.user = req.user.id;

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
    data: deletedProduct,
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

    console.log(product.photos);
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
