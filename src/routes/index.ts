import Router from '@koa/router';
import { register, login } from '../controllers/authController';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController';
import { authRequired } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
} from '../validators';

const router = new Router({ prefix: '/api' });

// Auth routes (public)
router.post('/auth/register', validateBody(registerSchema), register);
router.post('/auth/login', validateBody(loginSchema), login);

// Service routes (public)
router.get('/services', listServices);
router.get('/services/:id', validateParams(serviceIdSchema), getService);

// Service routes (protected)
router.post('/services', authRequired, validateBody(createServiceSchema), createService);
router.put(
  '/services/:id',
  authRequired,
  validateParams(serviceIdSchema),
  validateBody(updateServiceSchema),
  updateService,
);
router.delete('/services/:id', authRequired, validateParams(serviceIdSchema), deleteService);

export default router;
