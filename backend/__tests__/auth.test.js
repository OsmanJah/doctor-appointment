import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

const userPayload = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123',
  role: 'patient',
  gender: 'male',
};

import User from '../models/UserSchema.js';
import Doctor from '../models/DoctorSchema.js';

describe('Auth routes', () => {

  it('POST /api/v1/auth/register -> 201 created', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(userPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/auth/login -> 200 success & returns token', async () => {
    // Register user first
    await request(app).post('/api/v1/auth/register').send(userPayload);
    // Now login
    const res = await request(app).post('/api/v1/auth/login').send({
      email: userPayload.email,
      password: userPayload.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });
});
