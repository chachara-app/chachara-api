const ApiBuilder = require('claudia-api-builder');

module.exports = {
  badRequest: (message) => {
    return new ApiBuilder.ApiResponse({ message }, {
      'Content-Type': 'application/json'
    }, 400);
  }
};
