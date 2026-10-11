import express from 'express';
import {
  triggerEmergency,
  getActiveIncident,
  getIncidents,
  getIncidentById,
  updateLocationTrail,
  resolveIncident,
  acknowledgeAlert,
} from '../controllers/emergencyController.js';
import { authenticateJwt } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { emergencyLimiter } from '../middleware/rateLimiter.js';
import {
  triggerEmergencySchema,
  updateLocationTrailSchema,
  resolveIncidentSchema,
  acknowledgeAlertSchema,
} from '../validators/emergencyValidator.js';

const router = express.Router();

// Public contact acknowledgement endpoint (contacts click SMS link to confirm)
router.post('/:id/acknowledge', validateRequest(acknowledgeAlertSchema), acknowledgeAlert);

// Authenticated endpoints for the user
router.use(authenticateJwt);

router.post('/', emergencyLimiter, validateRequest(triggerEmergencySchema), triggerEmergency);
router.get('/active', getActiveIncident);
router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/:id/location', validateRequest(updateLocationTrailSchema), updateLocationTrail);
router.patch('/:id/resolve', validateRequest(resolveIncidentSchema), resolveIncident);

export default router;
