/* eslint-disable no-console */
require('dotenv').config();
const dbi = require('./db/dbi');
const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

const { NODE_ENV, COGNITO_POOL_ARN } = process.env;

const config = {
  providerARNs: NODE_ENV !== 'test' ? [COGNITO_POOL_ARN] : undefined,
};

api.registerAuthorizer('chachara-auth', config);

api.get('/', () => {
  return 'Fooo!';
}, { cognitoAuthorizer: 'chachara-auth' });

api.get('/languages/{id}/questions', (request) => {
  const id = request.pathParams.id;
  return dbi.query(`SELECT * FROM questions WHERE language_id=?;`, [id])
    .then(res => {
      dbi.closeConnection();
      return new ApiBuilder.ApiResponse({questions: res}, {'Content-Type': 'application/json'});
    })
    .catch((err) => {
      dbi.closeConnection();
      console.log(err);
      return new ApiBuilder.ApiResponse({message: 'Something went wrong'}, 500);
    });
});

module.exports = api;
