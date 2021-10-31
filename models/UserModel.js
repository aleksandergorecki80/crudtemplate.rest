const mongoose = require('mongoose');

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
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please enter a password']
    },
    date: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        default: 'user',
        enum: ['administrator', 'moderator', 'user']
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

const User = mongoose.model('user', UserShema);

module.exports = User;