import express from 'express';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/userController.js';
import { authenticateJwt } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/authValidator.js';

const router = express.Router();

router.use(authenticateJwt);

router.get('/me', getProfile);
router.patch('/me', validateRequest(updateProfileSchema), updateProfile);
router.patch('/me/password', validateRequest(changePasswordSchema), changePassword);
router.delete('/me', deleteAccount);

export default router;
