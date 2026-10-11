import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { authenticateJwt } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/logout', authenticateJwt, logout);
router.get('/me', authenticateJwt, getMe);
router.post('/refresh', refreshToken);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);

export default router;
