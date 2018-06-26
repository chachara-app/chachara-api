const mongoose = require("mongoose");
const { Question } = require('../models');

exports.dropDb = function () {
  return mongoose.connection.dropDatabase();
};

exports.seedDb = function (questions) {
  const questionDocs = questions.map(text => {
    return new Question({ text, language: 'es' });
  });
  return Question.insertMany(questionDocs);
};
