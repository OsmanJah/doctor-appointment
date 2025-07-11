import request from 'supertest';
import app from '../app.js';

describe('Health endpoint', () => {
  it('GET / should return 200 and Hello World!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello World!');
  });
});
