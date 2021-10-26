const app = require('./app');
const connectDB = require('./config/db');

// Connect DB
connectDB().then((res) =>{
    console.log(`Connected to ${res.connection.host}`);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode at port ${PORT}`);
});
