const sinon = require('sinon');
const api = require('../index');
const mongoose = require('mongoose');
const { dropDb, seedDb } = require('../db/seeds');

const questions = require('./data/questions.json');
const users = require('./data/users.json');
const recordings = require('./data/recordings.json');

describe('api', () => {
  let lambdaContextSpy;
  let seededData;
  beforeEach(() => {
    lambdaContextSpy = {
      done: sinon.spy()
    };

    return dropDb().then(() => seedDb(questions, users, recordings)).then(data => {
      seededData = {
        questions: data[0],
        user: data[1],
        recordings: data[2]
      };
    });
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

  describe('POST /users/{userId}/recordings', () => {
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
          questionId: seededData.questions[0]._id.toString()
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
          questionId: seededData.questions[0]._id.toString()
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
          questionId: seededData.questions[0]._id.toString()
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
          questionId: seededData.questions[0]._id.toString()
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
          questionId: seededData.questions[0]._id.toString()
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
    it('responds with 400 if questionId does not exist', done => {
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
          url: 'foo.com',
          questionId: '5b3dc343dcf178e1440db472'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('question with ID 5b3dc343dcf178e1440db472 does not exist');
      }).then(done, done);
    });
    it('responds with 400 if questionId is invalid', done => {
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
          url: 'foo.com',
          questionId: 'fooo'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('question with ID fooo does not exist');
      }).then(done, done);
    });
  });

  describe('POST /users', () => {
    it('responds with 400 if id not provided in post body', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users',
          httpMethod: 'POST'
        },
        body: {
          languages_spoken: ['eng'],
          languages_learning: ['es'],
          name: 'Harriet'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) {
          throw err;
        }

        let data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('id is required');
      }).then(done, done);
    });
    it('responds with 400 if name not provided in post body', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users',
          httpMethod: 'POST'
        },
        body: {
          languages_spoken: ['eng'],
          languages_learning: ['es'],
          id: 'abc123'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) {
          throw err;
        }

        let data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('name is required');
      }).then(done, done);
    });
    it('responds with 400 if languages_spoken not provided in post body', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users',
          httpMethod: 'POST'
        },
        body: {
          languages_learning: ['eng'],
          id: 'abc123',
          name: 'Harriet'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) {
          throw err;
        }

        let data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('languages_spoken is required');
      }).then(done, done);
    });
    it('responds with 400 if languages_learning not provided in post body', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users',
          httpMethod: 'POST'
        },
        body: {
          languages_spoken: ['eng'],
          id: 'abc123',
          name: 'Harriet'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) {
          throw err;
        }

        let data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('languages_learning is required');
      }).then(done, done);
    });

    it('responds with 201 if the user is successfully created', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users',
          httpMethod: 'POST'
        },
        body: {
          languages_spoken: ['eng'],
          languages_learning: ['es'],
          id: 'abc123',
          name: 'Harriet'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) {
          throw err;
        }

        let data = JSON.parse(res.body);
        expect(res.statusCode).toBe(201);
        expect(data.user.id).toBe('abc123');
        expect(data.user.name).toBe('Harriet');
        expect(data.user.languages_learning).toEqual(['es']);
        expect(data.user.languages_spoken).toEqual(['eng']);
      }).then(done, done);
    });
  });

  describe('GET /users/{userId}', () => {
    it('responds with 200 and the selected user', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}',
          httpMethod: 'GET'
        },
        pathParameters: {
          userId: '123'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) throw err;

        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(data.user.name).toBe('Harriet Test');
      }).then(done, done);
    });
    
    it('responds with 404 is the selected user is not found', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}',
          httpMethod: 'GET'
        },
        pathParameters: {
          userId: '456'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) throw err;

        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(404);
        expect(data.message).toBe('user 456 does not exist');
      }).then(done, done);
    });
  });

  describe('PUT /users/{userId}', () => {
    it('responds with 404 if the selected user is not found', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}',
          httpMethod: 'PUT'
        },
        pathParameters: {
          userId: '456'
        },
        body: {
          languages_spoken: ['eng'],
          languages_learning: ['es'],
          id: 'abc123',
          name: 'Harriet'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) throw err;

        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(404);
        expect(data.message).toBe('user 456 does not exist');
      }).then(done, done);
    });

    it('ignores invalid properties passed on the body', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}',
          httpMethod: 'PUT'
        },
        pathParameters: {
          userId: '123'
        },
        body: {
          not_allowed: 'foo',
          languages_spoken: ['eng'],
          languages_learning: ['es'],
          id: 'abc123',
          name: 'changed'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) throw err;

        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(data.user.not_allowed).toBe(undefined);
        expect(data.user.name).toBe('changed');
      }).then(done, done);
    });

    it('returns the original user if body has no properties', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}',
          httpMethod: 'PUT'
        },
        pathParameters: {
          userId: '123'
        },
        body: {}
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) throw err;

        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(data.user.name).toBe('Harriet Test');
      }).then(done, done);
    });

    it('returns 200 and the new user object if successful', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}',
          httpMethod: 'PUT',
        },
        pathParameters: {
          userId: '123',
        },
        body: {
          languages_spoken: ['eng', 'fr'],
          languages_learning: ['es'],
          id: 'abc123',
          name: 'A new name'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        if (err) throw err;

        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(data.user.languages_spoken).toEqual(['eng', 'fr']);
        expect(data.user.languages_learning).toEqual(['es']);
        expect(data.user.name).toBe('A new name');
      }).then(done, done);
    });
  });

  describe('GET /language/{languageId}/questions', () => {
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

  describe('GET /users/{userId}/recordings', () => {
    it('responds with 404 if the userId is not found', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings',
          httpMethod: 'GET'
        },
        pathParameters: {
          userId: 'nonexistant'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(404);
        expect(data.message).toBe('user nonexistant does not exist');
      }).then(done, done);
    });
    it('responds with 200 and the recordings belonging to the user', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings',
          httpMethod: 'GET'
        },
        pathParameters: {
          userId: '123'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(data.recordings.length).toBe(3);
        expect(data.recordings[0].question_id).toBe(data.recordings[0].question._id);
      }).then(done, done);
    });
  });

  describe('DELETE /users/{userId}/recordings/{recordingId}', () => {
    it('responds with 400 if the recording ID is not valid', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings/{recordingId}',
          httpMethod: 'DELETE'
        },
        pathParameters: {
          userId: '123',
          recordingId: 'foo'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('foo is not a valid Recording ID');
      }).then(done, done);
    });

    it('responds with 400 if the user cannot be found', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings/{recordingId}',
          httpMethod: 'DELETE'
        },
        pathParameters: {
          userId: '456',
          recordingId: seededData.recordings[0]._id.toString()
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe(`Recording ${seededData.recordings[0]._id.toString()} belonging to 456 could not be found`);
      }).then(done, done);
    });

    it('responds with 400 if the recording cannot be found', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings/{recordingId}',
          httpMethod: 'DELETE'
        },
        pathParameters: {
          userId: '123',
          recordingId: '5b3fd16ae706b120a8da89a2'
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(400);
        expect(data.message).toBe('Recording 5b3fd16ae706b120a8da89a2 belonging to 123 could not be found');
      }).then(done, done);
    });

    it('responds with 200 if the recording is successfully deleted', done => {
      api.proxyRouter({
        requestContext: {
          resourcePath: '/users/{userId}/recordings/{recordingId}',
          httpMethod: 'DELETE'
        },
        pathParameters: {
          userId: '123',
          recordingId: seededData.recordings[0]._id.toString()
        }
      }, lambdaContextSpy).then(() => {
        const [err, res] = lambdaContextSpy.done.firstCall.args;
        
        if (err) {
          throw err;
        }
        
        const data = JSON.parse(res.body);
        expect(res.statusCode).toBe(200);
        expect(data.message).toBe('Deleted');
      }).then(done, done);
    });
  });
});
