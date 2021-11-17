const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getComments,
    getComment,
    addComment
} = require('../controllers/comments');

const Comment = require('../models/Comment');

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(
        advancedResults(Comment, {
            path: 'product',
            select: 'title author'
        }),
        getComments
    )
    .post(protect, authorize('user', 'administrator'), addComment);
router
    .route('/:id')
    .get(getComment);

router
    .route('/')

module.exports = router;