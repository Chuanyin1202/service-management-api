import { Context } from 'koa';
import broker from '../broker';

export async function register(ctx: Context) {
  try {
    const result = await broker.call('auth.register', ctx.request.body);
    ctx.status = 201;
    ctx.body = { data: result };
  } catch (err: any) {
    ctx.throw(err.code || 500, err.message, { code: err.type });
  }
}

export async function login(ctx: Context) {
  try {
    const result = await broker.call('auth.login', ctx.request.body);
    ctx.status = 200;
    ctx.body = { data: result };
  } catch (err: any) {
    ctx.throw(err.code || 500, err.message, { code: err.type });
  }
}
