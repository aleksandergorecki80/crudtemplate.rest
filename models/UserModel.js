const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');
const jwtExpire = config.get('jwtExpire');
const bcrypt = require('bcryptjs');


const UserShema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name.'],
        minlength: [5, 'Title can not be less than 5 characters.'],
        maxlength: [50, 'Title can not be more than 50 characters.'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email.'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email adress.'
        ],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    date: {
        type: Date,
        default: Date.now()
    },
    role: {
        type: String,
        default: 'user',
        enum: ['moderator', 'user']
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
});

// Sign JWT and return
UserShema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, jwtSecret, {
        expiresIn: jwtExpire
    })
}

// Match user entered password to hashed password in database
UserShema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate and hash password token
UserShema.methods.getResetPasswordToken = function(){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('user', UserShema);

module.exports = User;