import { ServiceSchema, Context } from 'moleculer';
import { AppointmentServiceRepository } from '../repositories/AppointmentServiceRepository';

const appointmentRepository = new AppointmentServiceRepository();

const AppointmentServiceDef: ServiceSchema = {
  name: 'appointment',

  actions: {
    async list() {
      const services = await appointmentRepository.findAll();
      return services;
    },

    async get(ctx: Context<{ id: string }>) {
      const service = await appointmentRepository.findById(ctx.params.id);
      if (!service) {
        const error = new Error('Service not found') as Error & { code: number };
        error.code = 404;
        throw error;
      }
      return service;
    },

    async create(
      ctx: Context<{
        name: string;
        description?: string;
        price: number;
        showTime?: number;
        order?: number;
        isPublic?: boolean;
      }>,
    ) {
      const service = await appointmentRepository.create(ctx.params);
      return service;
    },

    async update(
      ctx: Context<{
        id: string;
        name?: string;
        description?: string;
        price?: number;
        showTime?: number;
        order?: number;
        isPublic?: boolean;
      }>,
    ) {
      const { id, ...data } = ctx.params;
      const service = await appointmentRepository.update(id, data);
      if (!service) {
        const error = new Error('Service not found') as Error & { code: number };
        error.code = 404;
        throw error;
      }
      return service;
    },

    async delete(ctx: Context<{ id: string }>) {
      const success = await appointmentRepository.softDelete(ctx.params.id);
      if (!success) {
        const error = new Error('Service not found') as Error & { code: number };
        error.code = 404;
        throw error;
      }
      return { message: 'Service deleted successfully' };
    },
  },
};

export default AppointmentServiceDef;
