import { AppointmentService, AppointmentServiceCreationAttributes } from '../models/AppointmentService';

export class AppointmentServiceRepository {
  async findAll(): Promise<AppointmentService[]> {
    return AppointmentService.findAll({
      where: { isRemove: false },
      order: [['order', 'ASC']],
    });
  }

  async findById(id: string): Promise<AppointmentService | null> {
    return AppointmentService.findOne({
      where: { id, isRemove: false },
    });
  }

  async create(data: AppointmentServiceCreationAttributes): Promise<AppointmentService> {
    return AppointmentService.create(data);
  }

  async update(id: string, data: Partial<AppointmentServiceCreationAttributes>): Promise<AppointmentService | null> {
    const service = await AppointmentService.findOne({
      where: { id, isRemove: false },
    });
    if (!service) return null;
    return service.update(data);
  }

  async softDelete(id: string): Promise<boolean> {
    const service = await AppointmentService.findOne({
      where: { id, isRemove: false },
    });
    if (!service) return false;
    await service.update({ isRemove: true });
    return true;
  }
}
