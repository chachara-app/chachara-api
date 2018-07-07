const mongoose = require("mongoose");
const { Question, User, Recording } = require('../models');

exports.dropDb = function () {
  return mongoose.connection.dropDatabase();
};

exports.seedDb = function (questions, users, recordings) {
  const questionDocs = questions.map(data => new Question(data));
  const userDocs = users.map(data => new User(data));
  return Promise.all([
    Question.insertMany(questionDocs),
    User.insertMany(userDocs)
  ])
    .then(res => {
      const questions = res[0];
      const users = res[1];
      const recordingDocs = recordings.map((r, i) => {
        return new Recording(Object.assign({}, r, {question_id: questions[i]._id.toString()}));
      });
      return Promise.all([questions, users, Recording.insertMany(recordingDocs)]);
    })
    .catch(console.log);
};
