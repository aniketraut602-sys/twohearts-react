const request = require('supertest');
const app = require('../index');
const { init, close } = require('../db/db');

beforeAll(() => {
  // Use an in-memory database for testing
  process.env.DATABASE_URL = 'sqlite::memory:';
  process.env.JWT_SECRET = 'test-secret';
  init();
  // Run migrations
  require('../scripts/migrate')();
});

afterAll(() => {
  close();
});

describe('Auth routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');
  });

  it('should not register a user with an existing email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test2@example.com',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test2@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(409);
  });

  it('should login a registered user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
  });
});