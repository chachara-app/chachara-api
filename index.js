/* eslint-disable no-console */
require('dotenv').config();
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
const ApiBuilder = require('claudia-api-builder');
const mongoose = require('mongoose');
const {Question} = require('./db/models');

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
        'Content-Types': 'application/json'
      });
    })
    .catch(err => {
      return new ApiBuilder.ApiResponse({ message: err }, 500);
    });
});

module.exports = api;
