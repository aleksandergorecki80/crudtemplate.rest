const app = require('./app');
const connectDB = require('./db');

// Connect DB
connectDB().then((res) =>{
    console.log(`Connected to ${res.connection.host}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err} on ${promise}`);
    server.close(() => process.exit(1));
  });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode at port ${PORT}`);
});
