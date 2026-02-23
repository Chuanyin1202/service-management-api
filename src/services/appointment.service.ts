import { ServiceSchema, Context, Errors } from 'moleculer';
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
        throw new Errors.MoleculerClientError('Service not found', 404, 'NOT_FOUND');
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
        throw new Errors.MoleculerClientError('Service not found', 404, 'NOT_FOUND');
      }
      return service;
    },

    async delete(ctx: Context<{ id: string }>) {
      const success = await appointmentRepository.softDelete(ctx.params.id);
      if (!success) {
        throw new Errors.MoleculerClientError('Service not found', 404, 'NOT_FOUND');
      }
      return { message: 'Service deleted successfully' };
    },
  },
};

export default AppointmentServiceDef;
