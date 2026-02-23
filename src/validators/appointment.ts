import Joi from 'joi';

export const createServiceSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'any.required': 'Service name is required',
  }),
  description: Joi.string().allow(null, '').optional(),
  price: Joi.number().integer().min(0).required().messages({
    'any.required': 'Price is required',
    'number.min': 'Price cannot be negative',
  }),
  showTime: Joi.number().integer().min(0).allow(null).optional(),
  order: Joi.number().integer().min(0).optional(),
  isPublic: Joi.boolean().optional(),
});

export const updateServiceSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().allow(null, '').optional(),
  price: Joi.number().integer().min(0).optional(),
  showTime: Joi.number().integer().min(0).allow(null).optional(),
  order: Joi.number().integer().min(0).optional(),
  isPublic: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const serviceIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid service ID format',
  }),
});
