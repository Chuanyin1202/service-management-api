import { Context } from 'koa';
import broker from '../broker';

export async function listServices(ctx: Context) {
  try {
    const services = await broker.call('appointment.list');
    ctx.body = { data: services };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function getService(ctx: Context) {
  try {
    const service = await broker.call('appointment.get', { id: ctx.params.id });
    ctx.body = { data: service };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function createService(ctx: Context) {
  try {
    const service = await broker.call('appointment.create', ctx.request.body);
    ctx.status = 201;
    ctx.body = { data: service };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function updateService(ctx: Context) {
  try {
    const body = ctx.request.body as Record<string, unknown>;
    const service = await broker.call('appointment.update', {
      id: ctx.params.id,
      ...body,
    });
    ctx.body = { data: service };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function deleteService(ctx: Context) {
  try {
    const result = await broker.call('appointment.delete', { id: ctx.params.id });
    ctx.body = { data: result };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}
