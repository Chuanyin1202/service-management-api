import { setupTestEnv, teardownTestEnv, broker } from '../helpers/setup';

describe('Appointment Service', () => {
  beforeAll(async () => {
    await setupTestEnv();
  });

  afterAll(async () => {
    await teardownTestEnv();
  });

  let createdServiceId: string;

  describe('appointment.create', () => {
    it('should create a new service', async () => {
      const result = (await broker.call('appointment.create', {
        name: 'Test Service',
        description: 'A test service',
        price: 1000,
        showTime: 60,
      })) as any;

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Service');
      expect(result.price).toBe(1000);
      expect(result.isRemove).toBe(false);
      expect(result.isPublic).toBe(true);
      createdServiceId = result.id;
    });
  });

  describe('appointment.list', () => {
    it('should return all non-removed services', async () => {
      const result = (await broker.call('appointment.list')) as any[];
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('appointment.get', () => {
    it('should return a service by ID', async () => {
      const result = (await broker.call('appointment.get', { id: createdServiceId })) as any;
      expect(result.id).toBe(createdServiceId);
      expect(result.name).toBe('Test Service');
    });

    it('should throw for non-existent ID', async () => {
      await expect(
        broker.call('appointment.get', { id: '00000000-0000-0000-0000-000000000000' }),
      ).rejects.toThrow('Service not found');
    });
  });

  describe('appointment.update', () => {
    it('should update a service', async () => {
      const result = (await broker.call('appointment.update', {
        id: createdServiceId,
        name: 'Updated Service',
        price: 2000,
      })) as any;
      expect(result.name).toBe('Updated Service');
      expect(result.price).toBe(2000);
    });

    it('should throw for non-existent ID', async () => {
      await expect(
        broker.call('appointment.update', {
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Ghost',
        }),
      ).rejects.toThrow('Service not found');
    });
  });

  describe('appointment.delete', () => {
    it('should soft-delete a service', async () => {
      const result = (await broker.call('appointment.delete', { id: createdServiceId })) as any;
      expect(result.message).toBe('Service deleted successfully');

      // Verify it's not returned in list
      const list = (await broker.call('appointment.list')) as any[];
      const found = list.find((s: any) => s.id === createdServiceId);
      expect(found).toBeUndefined();
    });

    it('should throw for already-deleted service', async () => {
      await expect(broker.call('appointment.delete', { id: createdServiceId })).rejects.toThrow(
        'Service not found',
      );
    });
  });
});
