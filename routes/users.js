const express = require('express');
const router = express.Router();
const { registerUser } = require ('../controllers/users');
const { check } = require('express-validator');



router.post('/', 
        check('name').notEmpty().withMessage('Username can not be null'), 
        check('email').notEmpty().withMessage('Email can not be null'), 
        registerUser
        );

module.exports = router;