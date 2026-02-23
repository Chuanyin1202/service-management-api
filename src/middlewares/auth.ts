import { Context, Next } from 'koa';
import { verifyToken } from '../utils/jwt';

export async function authRequired(ctx: Context, next: Next) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ctx.throw(401, 'Authentication required', { code: 'AUTH_REQUIRED' });
  }

  const token = authHeader.substring(7);

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return ctx.throw(401, 'Invalid or expired token', { code: 'INVALID_TOKEN' });
  }

  ctx.state.user = payload;
  await next();
}
