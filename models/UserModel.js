const mongoose = require('mongoose');

const UserShema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name.'],
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        default: 'user'
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