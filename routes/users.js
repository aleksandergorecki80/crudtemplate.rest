const express = require('express');
const router = express.Router();

const {
    getUsers
} = require('../controllers/users');

const { check } = require('express-validator');
const expressValidationResults = require('../middleware/expressValidationResults');
const { protect } = require('../middleware/auth');


const productsRouter = require('./products');

// Re-route into products routers
router.use('/:userId/products', productsRouter);



// Test users
router.route('/').get(getUsers);

module.exports = router;