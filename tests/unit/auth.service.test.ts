import { setupTestEnv, teardownTestEnv, broker } from '../helpers/setup';

describe('Auth Service', () => {
  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await teardownTestEnv();
  });

  describe('auth.register', () => {
    it('should register a new user and return token', async () => {
      const result = (await broker.call('auth.register', {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })) as any;

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      await broker.call('auth.register', {
        email: 'dup@example.com',
        password: 'password123',
        name: 'First User',
      });

      await expect(
        broker.call('auth.register', {
          email: 'dup@example.com',
          password: 'password456',
          name: 'Second User',
        }),
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('auth.login', () => {
    beforeAll(async () => {
      await broker.call('auth.register', {
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User',
      });
    });

    it('should login with valid credentials', async () => {
      const result = (await broker.call('auth.login', {
        email: 'login@example.com',
        password: 'password123',
      })) as any;

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('login@example.com');
    });

    it('should reject invalid email', async () => {
      await expect(
        broker.call('auth.login', {
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject invalid password', async () => {
      await expect(
        broker.call('auth.login', {
          email: 'login@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
