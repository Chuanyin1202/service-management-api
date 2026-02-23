import { Context, Next } from 'koa';

interface AppError extends Error {
  status?: number;
  code?: string;
}

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    const error = err as AppError;
    const status = error.status || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const message = status === 500 ? 'Internal server error' : error.message;

    ctx.status = status;
    ctx.body = {
      error: {
        code,
        message,
      },
    };

    if (status === 500) {
      console.error('Unhandled error:', error);
    }
  }
}
