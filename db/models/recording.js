const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  length_millis: {
    type: Number,
    required: true
  },
  created_at: {
    type: Number,
    required: true
  },
  question_id: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Recording', schema);
