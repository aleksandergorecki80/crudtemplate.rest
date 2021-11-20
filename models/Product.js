const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title.'],
    trim: true,
    minlength: [5, 'Title can not be less than 5 characters.'],
    maxlength: [50, 'Title can not be more than 50 characters.'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters.']
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
  averageRating: {
      type: Number,
      min: 1,
      max: 5
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse population with virtuals
ProductSchema.virtual('comments', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

const Product = mongoose.model('product', ProductSchema);
module.exports = Product;