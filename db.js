const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    const connect = await mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    return connect;
}

module.exports = connectDB;