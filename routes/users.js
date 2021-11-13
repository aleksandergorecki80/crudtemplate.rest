const express = require('express');
const router = express.Router();
const {
    getUsers,
    deleteUser,
    getSingleUser,
    createUser,
    updateUser
} = require('../controllers/users');

const User = require('../models/UserModel');
const productsRouter = require('./products');

const advancedResults = require('../middleware/advancedResults');
const expressValidationResults = require('../middleware/expressValidationResults');

const { protect, authorize } = require('../middleware/auth');
const { check } = require('express-validator');



// Re-route into products routers
router.use('/:userId/products', productsRouter);

// Use protect and authorise for admin middlewares
router.use(protect);
router.use(authorize('administrator'));

// Get all users users / Create user
router
    .route('/')
    .get(advancedResults(User, {
        path: 'products', 
        select: 'title -_id -user'
    }), getUsers)
    .post(createUser);

// Get single user, Update user, Delete
router
    .route('/:userId')
    .get(getSingleUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;