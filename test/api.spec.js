const sinon = require('sinon');
const api = require('../index');

describe('api', () => {
  let lambdaContextSpy;
  beforeEach(() => {
    lambdaContextSpy = {
      done: sinon.spy()
    };
  });

  describe('GET /', () => {
    it("responds with 200 and a message of 'Fooo!'", done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/',
          httpMethod: 'GET',
        },
      },lambdaContextSpy).then(() => {
        const response = lambdaContextSpy.done.firstCall.args[1];
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('"Fooo!"');
      }).then(done, done);
    });
  });
  describe('GET /language/:languageId/questions', () => {
    it('responds with 200 and an array of questions in the specified language', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/languages/{id}/questions',
          httpMethod: 'GET',
        },
        pathParameters: {
          id: 1
        },
      }, lambdaContextSpy).then(() => {
        const response = lambdaContextSpy.done.firstCall.args;
        expect(response[0]).toBe(null);
        expect(response[1].statusCode).toBe(200);
        const data = JSON.parse(response[1].body);
        expect(data.questions.length).toBe(5);
        expect(data.questions[0]).toHaveProperty('question');
      }).then(done, done);
    });
  });
});
