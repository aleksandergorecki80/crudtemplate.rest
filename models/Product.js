const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductShema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title.'],
    trim: true,
    maxlength: [50, 'Title can not be more than 50 characters.'],
    unique: true
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Title can not be more than 500 characters.']
  },
  photos: {
    type: [String],
    default: 'no-photo.jpg'
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  price: {
      type: Number,
      required: [true, 'Please add a price.']
  },
  rating: {
      type: Number,
      min: 1,
      max: 5
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
      commentTitle: {
        type: String,
        required: [true, 'Please add a title.'],
      },
      text: {
        type: String,
        required: [true, 'Please write a comment.'],
      },
      userName: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now(),
      }
    }
  ]
});

// Create product slug from the title
ProductShema.pre('save', function(next){
  this.slug = slugify(this.title, { lower: true });
  next();
});


const Product = mongoose.model('Product', ProductShema);
module.exports = Product;