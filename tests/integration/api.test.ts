import supertest from 'supertest';
import { startApp, stopApp } from '../../src/app';
import type { Server } from 'http';

let server: Server;
let request: supertest.Agent;
let authToken: string;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  server = (await startApp()) as unknown as Server;
  request = supertest(server);
});

afterAll(async () => {
  await stopApp(server as any);
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request.post('/api/auth/register').send({
        email: 'integration@test.com',
        password: 'password123',
        name: 'Integration User',
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('integration@test.com');
      expect(res.body.data.user).not.toHaveProperty('password');
      authToken = res.body.data.token;
    });

    it('should reject duplicate email', async () => {
      const res = await request.post('/api/auth/register').send({
        email: 'integration@test.com',
        password: 'password456',
        name: 'Duplicate User',
      });

      expect(res.status).toBe(409);
    });

    it('should validate required fields', async () => {
      const res = await request.post('/api/auth/register').send({
        email: 'bad-email',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'integration@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('integration@test.com');
    });

    it('should reject invalid credentials', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'integration@test.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'nobody@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });
});

describe('Services API', () => {
  let serviceId: string;

  describe('POST /api/services (protected)', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request.post('/api/services').send({
        name: 'No Auth Service',
        price: 500,
      });

      expect(res.status).toBe(401);
    });

    it('should create a service with valid token', async () => {
      const res = await request
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Haircut',
          description: 'Basic haircut service',
          price: 500,
          showTime: 30,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Haircut');
      expect(res.body.data.price).toBe(500);
      serviceId = res.body.data.id;
    });

    it('should validate required fields', async () => {
      const res = await request
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Missing name and price' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/services (public)', () => {
    it('should list services without auth', async () => {
      const res = await request.get('/api/services');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/services/:id (public)', () => {
    it('should get a service by ID', async () => {
      const res = await request.get(`/api/services/${serviceId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(serviceId);
      expect(res.body.data.name).toBe('Haircut');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request.get('/api/services/not-a-uuid');

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent ID', async () => {
      const res = await request.get('/api/services/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/services/:id (protected)', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request.put(`/api/services/${serviceId}`).send({
        name: 'Updated',
      });

      expect(res.status).toBe(401);
    });

    it('should update a service', async () => {
      const res = await request
        .put(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Premium Haircut',
          price: 800,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Premium Haircut');
      expect(res.body.data.price).toBe(800);
    });
  });

  describe('DELETE /api/services/:id (protected)', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request.delete(`/api/services/${serviceId}`);

      expect(res.status).toBe(401);
    });

    it('should soft-delete a service', async () => {
      const res = await request
        .delete(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Service deleted successfully');
    });

    it('should not find deleted service in list', async () => {
      const res = await request.get('/api/services');

      const found = res.body.data.find((s: any) => s.id === serviceId);
      expect(found).toBeUndefined();
    });
  });
});
