const express = require('express');
const app = express();

// Import routes
const users = require('./routes/users');
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const resetpassword = require('./routes/resetpassword');
const products = require('./routes/products');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Init Middleware
app.use(express.json());

// Define routes
app.use('/api/v1/users', users);
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/resetpassword', resetpassword);
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