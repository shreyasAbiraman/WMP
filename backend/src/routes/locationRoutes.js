import express from 'express';
import {
  startLocationSession,
  getActiveSession,
  getSessionByShareCode,
  updateCoordinates,
  stopLocationSession,
} from '../controllers/locationController.js';
import { authenticateJwt } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { startLocationSessionSchema, updateCoordinatesSchema } from '../validators/locationValidator.js';

const router = express.Router();

// Publicly accessible via secret shareCode for trusted viewers
router.get('/shared/:code', getSessionByShareCode);

// Authenticated session controls
router.use(authenticateJwt);

router.post('/', validateRequest(startLocationSessionSchema), startLocationSession);
router.get('/active', getActiveSession);
router.post('/:id/updates', validateRequest(updateCoordinatesSchema), updateCoordinates);
router.patch('/:id/stop', stopLocationSession);

export default router;
