import { Context, Next } from 'koa';
import Joi from 'joi';

export function validateBody(schema: Joi.ObjectSchema) {
  return async (ctx: Context, next: Next) => {
    const { error, value } = schema.validate(ctx.request.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      ctx.throw(400, messages, { code: 'VALIDATION_ERROR' });
    }

    ctx.request.body = value;
    await next();
  };
}

export function validateParams(schema: Joi.ObjectSchema) {
  return async (ctx: Context, next: Next) => {
    const { error, value } = schema.validate(ctx.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ');
      ctx.throw(400, messages, { code: 'VALIDATION_ERROR' });
    }

    ctx.params = value;
    await next();
  };
}
