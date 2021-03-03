require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    const todo = {
      todo: 'get newspaper',
      completed: false,
    };

    const todoResult = {
      ...todo,
      user_id: 2,
      id: 6
    };

    test('creates an item for todo list', async() => {

      const data = await fakeRequest(app)
        .post('/api/todos')
        .set('Authorization', token)
        .send(todo)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(todoResult);
    });

    test('gets the todo list for the user', async() => {

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(todoResult);
    });

    test('gets an item in the todo list', async() => {

      const data = await fakeRequest(app)
        .get('/api/todos/6')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(todoResult);
    });

    test('updates completed to true on an item in the todo list', async() => {

      const updatedTodo = {
        todo: 'get newspaper',
        completed: true,
      };

      const updatedTodoResult = {
        ...updatedTodo,
        user_id: 2,
        id: 6
      };

      const data = await fakeRequest(app)
        .put('/api/todos/6')
        .set('Authorization', token)
        .send(updatedTodo)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(updatedTodoResult);
    });

  });
});
