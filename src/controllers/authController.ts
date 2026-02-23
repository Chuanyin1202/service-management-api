import { Context } from 'koa';
import broker from '../broker';

export async function register(ctx: Context) {
  try {
    const result = await broker.call('auth.register', ctx.request.body);
    ctx.status = 201;
    ctx.body = { data: result };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}

export async function login(ctx: Context) {
  try {
    const result = await broker.call('auth.login', ctx.request.body);
    ctx.status = 200;
    ctx.body = { data: result };
  } catch (err: any) {
    const status = err.code || 500;
    ctx.throw(typeof status === 'number' ? status : 500, err.message);
  }
}
