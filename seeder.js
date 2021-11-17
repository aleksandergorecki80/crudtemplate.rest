const fs = require('fs');
const mongoose = require('mongoose');
const config = require('config');
const mongoURI = config.get('mongoURI');

const Comments = require('./models/Comment');

// connect do DB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const comments = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/comments.json`, 'utf-8')
);

// Import into DB
const importData = async () =>{
    try {
        await Comments.create(comments);
        console.log('Data imported')
        process.exit();
    } catch (err) { 
        console.log(err);
    }
}

// Delete data
const deleteData = async () =>{
    try {
        await Comments.deleteMany();
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