const request = require('supertest');
process.env.JWT_ACCESS_SECRET = 'test';
process.env.JWT_REFRESH_SECRET = 'test';

jest.mock('../config/db', () => ({ connectMongo: jest.fn() }));
jest.mock('../config/redis', () => ({ connectRedis: jest.fn(), getRedis: () => ({ call: jest.fn(), ping: jest.fn() }) }));
jest.mock('../models/User', () => ({}));

describe('app', () => {
  it('serves /health', async () => {
    const app = require('../app');
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
