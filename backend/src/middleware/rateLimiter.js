import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      statusCode: 429,
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 login/register attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      statusCode: 429,
    },
  },
});

export const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // up to 10 SOS trigger requests per min per user
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Emergency trigger request limit reached. Please wait a moment before re-triggering.',
      statusCode: 429,
    },
  },
});
