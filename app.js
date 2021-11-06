const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');

// Import routes
const auth = require('./routes/auth');
const products = require('./routes/products');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Define routes
// app.use('/api/v1/users', users);
app.use('/api/v1/auth', auth);
app.use('/api/v1/products', products);

// Use error midleware
app.use(errorHandler);

// PRODUCTION STATIC ASSETS
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('./client/build'));
    app.get('^(?!api\/)[\/\w\.\,-]*', (req, res) => {
      res.sendFile(path.resolve(__dirname, './client', 'build', 'index.html'));
    });
  }

console.log(`Running in ${process.env.NODE_ENV} mode.`);
module.exports = app;