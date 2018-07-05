/* eslint-disable no-console */
require('dotenv').config();
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
const ApiBuilder = require('claudia-api-builder');
const mongoose = require('mongoose');
const { Question, Recording, User } = require('./db/models');
const { badRequest } = require('./lib/response_helpers');

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
      else return new Recording({
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

module.exports = api;
