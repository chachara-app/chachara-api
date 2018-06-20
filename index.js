require('dotenv').config();
const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

const { NODE_ENV, COGNITO_POOL_ARN } = process.env;

const config = {
  providerARNs: NODE_ENV !== 'test' ? COGNITO_POOL_ARN : undefined,
};

api.registerAuthorizer('chachara-auth', config);

api.get(
  '/',
  () => {
    return 'Fooo!';
  },
  { cognitoAuthorizer: 'chachara-auth' }
);

module.exports = api;
