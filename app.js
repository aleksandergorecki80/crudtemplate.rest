const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require("express-rate-limit");
const cors = require('cors')

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

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100    // limit each IP to 100 requests per windowMs
});
//  apply to all requests
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS 
// Cross-Origin Resource Sharing allows a server to indicate any origins (domain, scheme, or port) other than its own from
app.use(cors());

// Define routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/products', products);
app.use('/api/v1/users', users);
app.use('/api/v1/comments', comments);

// Use error midleware
app.use(errorHandler);

// PRODUCTION STATIC ASSETS
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
    // ---    FOR FRONTEND  ---
    // app.get('^(?!api\/)[\/\w\.\,-]*', (req, res) => {
    //   res.sendFile(path.resolve(__dirname, './client', 'build', 'index.html'));
    // });
  }

console.log(`Running in ${process.env.NODE_ENV} mode.`);
module.exports = app;