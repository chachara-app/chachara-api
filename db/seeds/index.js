const mongoose = require("mongoose");
const { Question } = require('../models');

exports.dropDb = function () {
  return mongoose.connection.dropDatabase();
};

exports.seedDb = function (questions) {
  const questionDocs = questions.map(data => new Question(data));
  return Question.insertMany(questionDocs);
};
