/* eslint-disable no-console */
require('dotenv').config();
const ApiBuilder = require('claudia-api-builder');
const mongoose = require('mongoose');
const {Question} = require('./db/models');

const api = new ApiBuilder();

const { NODE_ENV, COGNITO_POOL_ARN } = process.env;

const config = {
  providerARNs: NODE_ENV !== 'test' ? [COGNITO_POOL_ARN] : undefined,
};

api.registerAuthorizer('chachara-auth', config);

const DB_URI = process.env[`${NODE_ENV}_DB_URI`];
mongoose.connect(DB_URI);

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
    });
});

module.exports = api;
