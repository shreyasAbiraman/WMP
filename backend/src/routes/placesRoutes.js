import express from 'express';
import { getNearbyPlaces } from '../controllers/placesController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateJwt);

router.get('/nearby', getNearbyPlaces);

export default router;
