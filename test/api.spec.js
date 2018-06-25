const sinon = require('sinon');
const api = require('../index');

describe('api', () => {
  let lambdaContextSpy;
  beforeEach(() => {
    lambdaContextSpy = { done: sinon.spy() };
  });

  describe('GET /', () => {
    it("responds with 200 and a message of 'Fooo!'", done => {
      api
        .proxyRouter(
          {
            requestContext: {
              resourcePath: '/',
              httpMethod: 'GET',
            },
          },
          lambdaContextSpy
        )
        .then(() => {
          const response = lambdaContextSpy.done.firstCall.args[1];
          expect(response.statusCode).toBe(200);
          expect(response.body).toBe('"Fooo!"');
        })
        .then(done, done);
    });
  });
});

describe('GET /language/:language/questions', () => {
  it('responds with 200 and an array of questions in the specified language', done => {});
});
