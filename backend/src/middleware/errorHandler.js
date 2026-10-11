import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} failed: ${err.message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Mongoose validation error', 400, err.errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, `A record with this ${field} already exists.`, 409);
  }

  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid resource identifier format.', 400);
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File size exceeds 25MB limit.', 400);
    }
    return errorResponse(res, `File upload error: ${err.message}`, 400);
  }

  return errorResponse(
    res,
    process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message,
    err.statusCode || 500
  );
};
