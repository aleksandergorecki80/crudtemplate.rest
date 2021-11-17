const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');

const cookieParser = require('cookie-parser');

// Import routes
const auth = require('./routes/auth');
const products = require('./routes/products');
const users = require('./routes/users');
const comments = require('./routes/comments');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// File uploading
app.use(fileUpload());

// Define routes
// app.use('/api/v1/users', users);
app.use('/api/v1/auth', auth);
app.use('/api/v1/products', products);
app.use('/api/v1/users', users);
app.use('/api/v1/comments', comments);

// Use error midleware
app.use(errorHandler);

app.use(express.static(path.join(__dirname, 'public'))); // usun !!
// PRODUCTION STATIC ASSETS
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('^(?!api\/)[\/\w\.\,-]*', (req, res) => {
      res.sendFile(path.resolve(__dirname, './client', 'build', 'index.html'));
    });
  }

console.log(`Running in ${process.env.NODE_ENV} mode.`);
module.exports = app;