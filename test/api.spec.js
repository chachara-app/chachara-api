const sinon = require('sinon');
const api = require('../index');
const mongoose = require('mongoose');
const { dropDb, seedDb } = require('../db/seeds');

const questions = require('./data/questions.json');

describe('api', () => {
  let lambdaContextSpy;
  beforeEach(() => {
    lambdaContextSpy = {
      done: sinon.spy()
    };

    return dropDb().then(() => seedDb(questions));
  });

  afterAll(() => mongoose.disconnect());

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
          resourcePath: '/languages/{language}/questions',
          httpMethod: 'GET',
        },
        pathParameters: {
          language: 'es'
        },
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;

        if (err) {
          throw err;
        }

        expect(res.statusCode).toBe(200);
        const data = JSON.parse(res.body);
        expect(data.questions.length).toBe(5);
        expect(data.questions[0]).toHaveProperty('text');
        expect(data.questions[0]).toHaveProperty('language');
        expect(data.questions[0]).toHaveProperty('_id');
      }).then(done, done);
    });
  });
});
