import express from 'express';
import {
  startJourney,
  getActiveJourney,
  getJourneys,
  getJourneyById,
  checkInJourney,
  completeJourney,
  cancelJourney,
} from '../controllers/journeyController.js';
import { authenticateJwt } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { startJourneySchema, journeyCheckInSchema } from '../validators/journeyValidator.js';

const router = express.Router();

router.use(authenticateJwt);

router.post('/', validateRequest(startJourneySchema), startJourney);
router.get('/active', getActiveJourney);
router.get('/', getJourneys);
router.get('/:id', getJourneyById);
router.patch('/:id/check-in', validateRequest(journeyCheckInSchema), checkInJourney);
router.patch('/:id/complete', completeJourney);
router.patch('/:id/cancel', cancelJourney);

export default router;
