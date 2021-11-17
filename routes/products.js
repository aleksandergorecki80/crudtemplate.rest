const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  productPhotoUpload
} = require('../controllers/products');

const Product = require('../models/Product');
const commentRouter = require('./comments');
const advancedResults = require('../middleware/advancedResults');

const { protect, authorize } = require('../middleware/auth');

// Re-route int other routes
router.use('/:productId/comments', commentRouter);

router
    .route('/')
    .get(advancedResults(Product, {
        path: 'user',
        select: 'name role -_id',
      }), getProducts)
    .post(protect, authorize('administrator', 'moderator'), createProduct);

router
    .route('/:id')
    .get(getProduct)
    .put(protect, authorize('administrator', 'moderator'), updateProduct)
    .delete(protect, authorize('administrator', 'moderator'), deleteProduct);

router
    .route('/:id/photo').put(productPhotoUpload);

module.exports = router;
