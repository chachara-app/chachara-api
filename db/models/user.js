const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  languages_learning: {
    type: Array,
    default: []
  },
  languages_spoken: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model('User', schema);