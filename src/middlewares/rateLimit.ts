import { Context, Next } from 'koa';
import { appConfig } from '../config/app';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

// 定期清理過期 entries，防止記憶體無限增長
const CLEANUP_INTERVAL = 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, CLEANUP_INTERVAL).unref();

export async function rateLimit(ctx: Context, next: Next) {
  const ip = ctx.ip;
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + appConfig.rateLimit.duration,
    });
    await next();
    return;
  }

  record.count++;

  if (record.count > appConfig.rateLimit.max) {
    ctx.status = 429;
    ctx.body = {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    };
    return;
  }

  await next();
}
