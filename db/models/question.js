const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Question', schema);
