require('dotenv').config();
const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

api.registerAuthorizer('chachara-auth', {
  providerARNs: [process.env.COGNITO_POOL_ARN],
});

api.get(
  '/',
  () => {
    return 'Fooooooooo!';
  },
  { cognitoAuthorizer: 'chachara-auth' }
);

module.exports = api;
