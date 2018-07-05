const sinon = require('sinon');
const api = require('../index');
const mongoose = require('mongoose');
const { dropDb, seedDb } = require('../db/seeds');

const questions = require('./data/questions.json');
const users = require('./data/users.json');

describe('api', () => {
  let lambdaContextSpy;
  beforeEach(() => {
    lambdaContextSpy = {
      done: sinon.spy()
    };

    return dropDb().then(() => seedDb(questions, users));
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

  describe('POST /users/:userId/recordings', () => {
    it('responds with 201 and the new recording if recording saved successfully', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings',
          httpMethod: 'POST'
        },
        pathParameters: {
          userId: '123'
        },
        body: {
          language: 'es',
          url: 'http://www.foo.com',
          lengthMillis: 100,
          questionId: 1234
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(201);
        expect(data.recording.user_id).toBe('123');
        expect(data.recording.length_millis).toBe(100);
      }).then(done, done);
    });
    it('responds with 400 if url not provided in post body', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings',
          httpMethod: 'POST'
        },
        pathParameters: {
          userId: '123'
        },
        body: {
          language: 'es',
          lengthMillis: 100,
          questionId: 1234
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('url is required');
      }).then(done, done);
    });
    it('responds with 400 if lengthMillis not provided in post body', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings',
          httpMethod: 'POST'
        },
        pathParameters: {
          userId: '123'
        },
        body: {
          language: 'es',
          url: 'www.foo.com',
          questionId: 1234
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('lengthMillis is required');
      }).then(done, done);
    });
    it('responds with 400 if language not provided in post body', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings',
          httpMethod: 'POST'
        },
        pathParameters: {
          userId: '123'
        },
        body: {
          url: 'www.foo.com',
          lengthMillis: 100,
          questionId: 1234
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('language is required');
      }).then(done, done);
    });
    it('responds with 400 if questionId not provided in post body', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings',
          httpMethod: 'POST'
        },
        pathParameters: {
          userId: '123'
        },
        body: {
          url: 'www.foo.com',
          lengthMillis: 100,
          language: 'es'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('questionId is required');
      }).then(done, done);
    });
    it('responds with 400 if given user does not exist', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings',
          httpMethod: 'POST'
        },
        pathParameters: {
          userId: 'nonexistant'
        },
        body: {
          url: 'www.foo.com',
          lengthMillis: 100,
          language: 'es',
          questionId: '123'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('user nonexistant does not exist');
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
