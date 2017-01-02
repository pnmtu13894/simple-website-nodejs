var mongoose = require('mongoose');

var User = mongoose.model('User', {
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  }
});

module.exports = {User};
