var mongoose = require('mongoose');

var Book = mongoose.model('Book', {
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  author: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  type: {
    type: String,
    trim: true,
    minlength: 1
  },
  price: {
    type: Number
  },
  time: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String
  }
});

module.exports = {Book};
