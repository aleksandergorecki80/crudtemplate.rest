const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title.'],
    trim: true,
    minlength: [5, 'Title can not be less than 5 characters.'],
    maxlength: [50, 'Title can not be more than 50 characters.'],
    unique: true,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
    maxlength: [500, 'Text can not be more than 500 characters.'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

// Static method to get average rating and save
CommentSchema.statics.getAverageRating = async function(productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating'}
      }
    }
  ]);
  try {
    await this.model('product').findByIdAndUpdate(productId, {
      averageRating: obj[0].averageRating
    }, 
    { new: true });
  } catch (err) {
    console.error(err);
  }
}

// Call getAverageRating after save
CommentSchema.post('save', function(){
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating before remove
CommentSchema.post('remove', function(){
  this.constructor.getAverageRating(this.product);
});

const Comment = mongoose.model('comment', CommentSchema);
module.exports = Comment;
