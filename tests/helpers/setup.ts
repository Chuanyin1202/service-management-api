import { sequelize } from '../../src/models';
import broker from '../../src/broker';
import AuthService from '../../src/services/auth.service';
import AppointmentServiceDef from '../../src/services/appointment.service';

let initialized = false;

export async function setupTestEnv() {
  if (!initialized) {
    broker.createService(AuthService);
    broker.createService(AppointmentServiceDef);
    await broker.start();
    initialized = true;
  }
  await sequelize.sync({ force: true });
}

export async function teardownTestEnv() {
  await broker.stop();
  await sequelize.close();
  initialized = false;
}

export { broker, sequelize };
