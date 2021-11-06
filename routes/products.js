const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products');

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getProducts)
    .post(protect, authorize('administrator', 'moderator'), createProduct);

router
    .route('/:id')
    .get(getProduct)
    .put(protect, authorize('administrator', 'moderator'), updateProduct)
    .delete(protect, authorize('administrator', 'moderator'), deleteProduct);

module.exports = router;
