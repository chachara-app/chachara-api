const mongoose = require("mongoose");
const { Question } = require('../models');
const { User } = require('../models');

exports.dropDb = function () {
  return mongoose.connection.dropDatabase();
};

exports.seedDb = function (questions, users) {
  const questionDocs = questions.map(data => new Question(data));
  const userDocs = users.map(data => new User(data));
  return Promise.all([
    Question.insertMany(questionDocs),
    User.insertMany(userDocs)
  ]);
};
