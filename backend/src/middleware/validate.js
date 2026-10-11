import { errorResponse } from '../utils/apiResponse.js';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.errors) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return errorResponse(res, 'Validation error in request payload', 400, issues);
      }
      return errorResponse(res, 'Invalid request data', 400, error.message);
    }
  };
};
