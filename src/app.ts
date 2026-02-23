import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import dotenv from 'dotenv';

dotenv.config();

import { appConfig } from './config/app';
import { sequelize } from './models';
import broker from './broker';
import AuthService from './services/auth.service';
import AppointmentServiceDef from './services/appointment.service';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimit } from './middlewares/rateLimit';
import router from './routes';

const app = new Koa();

// Middlewares
app.use(errorHandler);
app.use(rateLimit);
app.use(cors());
app.use(bodyParser());

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

export async function startApp() {
  // Load Moleculer services
  broker.createService(AuthService);
  broker.createService(AppointmentServiceDef);

  // Start Moleculer broker
  await broker.start();

  // Sync database (for test/dev; use migrations in production)
  if (appConfig.nodeEnv === 'test') {
    await sequelize.sync({ force: true });
  }

  // Start HTTP server
  const server = app.listen(appConfig.port, () => {
    if (appConfig.nodeEnv !== 'test') {
      console.log(`Server running on port ${appConfig.port}`);
    }
  });

  return server;
}

export async function stopApp(server?: ReturnType<typeof app.listen>) {
  if (server) {
    server.close();
  }
  await broker.stop();
  await sequelize.close();
}

// Start if not imported as module
if (require.main === module) {
  startApp().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
