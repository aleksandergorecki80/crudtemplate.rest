const fs = require('fs');
const mongoose = require('mongoose');
const config = require('config');
const mongoURI = config.get('mongoURI');

const Product = require('./models/Product');

// connect do DB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const products = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/products.json`, 'utf-8')
);

// Import into DB
const importData = async () =>{
    try {
        await Product.create(products);
        console.log('Data imported')
        process.exit();
    } catch (err) { 
        console.log(err);
    }
}

// Delete data
const deleteData = async () =>{
    try {
        await Product.deleteMany();
        console.log('Data destroyed')
        process.exit();
    } catch (err) { 
        console.log(err);
    }
}

if(process.argv[2] === '-i'){
    importData();
} else if (process.argv === '-d') {
    deleteData();
}