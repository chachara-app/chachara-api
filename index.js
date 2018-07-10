/* eslint-disable no-console */
require('dotenv').config();
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
const ApiBuilder = require('claudia-api-builder');
const mongoose = require('mongoose');
const { Question, Recording, User } = require('./db/models');
const { badRequest, notFound } = require('./lib/response_helpers');

const api = new ApiBuilder();

const { NODE_ENV, COGNITO_POOL_ARN } = process.env;

const config = {
  providerARNs: [COGNITO_POOL_ARN],
};

api.registerAuthorizer('chachara-auth', config);

const DB_URI = process.env[`${NODE_ENV}_DB_URI`];

mongoose.connect(DB_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(console.log);

api.get('/', () => {
  return 'Fooo!';
}, { cognitoAuthorizer: 'chachara-auth' });

api.get('/languages/{language}/questions', (request) => {
  const { language } = request.pathParams;

  return Question.find({ language })
    .then(questions => {
      return new ApiBuilder.ApiResponse({ questions }, {
        'Content-Type': 'application/json'
      });
    })
    .catch(err => {
      return new ApiBuilder.ApiResponse({ message: err }, 500);
    });
});

api.get('/users/{userId}/recordings', (request) => {
  const { userId } = request.pathParams;
  return User.findOne({ id: userId })
    .then(user => {
      if (!user) return Promise.reject({
        response: notFound(`user ${userId} does not exist`)
      });

      return Recording.aggregate([
        {
          $match: {
            user_id: userId
          }
        },
        {
          $lookup: {
            from: 'questions',
            localField: 'question_id',
            foreignField: '_id',
            as: 'question'
          }
        }
      ]);
    })
    .then(recordings => {
      recordings = recordings.map(r => {
        r.question = r.question[0];
        return r;
      });
      return new ApiBuilder.ApiResponse({ recordings }, {
        'Content-Type': 'application/json'
      });
    })
    .catch(err => {
      if (err.response) return err.response;
      else return new ApiBuilder.ApiResponse({ message: err }, 500);
    });
});

api.post('/users/{userId}/recordings', (request) => {
  if (!request.body.language) return badRequest('language is required');
  if (!request.body.lengthMillis) return badRequest('lengthMillis is required');
  if (!request.body.url) return badRequest('url is required');
  if (!request.body.questionId) return badRequest('questionId is required');

  return User.findOne({id: request.pathParams.userId})
    .then((user) => {
      if (!user) return Promise.reject({
        response: badRequest(`user ${request.pathParams.userId} does not exist`)
      });
      return Question.findById(request.body.questionId)
        .catch(() => {
          return Promise.reject({
            response: badRequest(`question with ID ${request.body.questionId} does not exist`)
          });
        });
    })
    .then((question) => {
      if (question === null) return Promise.reject({
        response: badRequest(`question with ID ${request.body.questionId} does not exist`)
      });
      return new Recording({
        user_id: request.pathParams.userId,
        language: request.body.language,
        url: request.body.url,
        length_millis: request.body.lengthMillis,
        question_id: request.body.questionId,
        created_at: new Date().getTime()
      }).save();
    })
    .then(res => {
      return new ApiBuilder.ApiResponse({ recording: res }, {
        'Content-Type': 'application/json'
      }, 201);
    })
    .catch(err => {
      if (err.response) return err.response;
      console.log(err);
    });
}, { cognitoAuthorizer: 'chachara-auth' });

api.delete('/users/{userId}/recordings/{recordingId}', (request) => {
  const {userId, recordingId} = request.pathParams;
  return Recording.findOneAndRemove({user_id: userId, _id: recordingId})
    .then(res => {
      if (!res) return badRequest(`Recording ${recordingId} belonging to ${userId} could not be found`);
      else return new ApiBuilder.ApiResponse({ message: 'Deleted' }, {
        'Content-Type': 'application/json'
      }, 200);
    })
    .catch(err => {
      if (err.name === 'CastError') {
        return badRequest(`${request.pathParams.recordingId} is not a valid Recording ID`);
      }
    });
}, {cognitoAuthorizer: 'chachara-auth'});

module.exports = api;
