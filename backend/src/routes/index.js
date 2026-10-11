import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import contactRoutes from './contactRoutes.js';
import emergencyRoutes from './emergencyRoutes.js';
import journeyRoutes from './journeyRoutes.js';
import locationRoutes from './locationRoutes.js';
import evidenceRoutes from './evidenceRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import placesRoutes from './placesRoutes.js';
import aiRoutes from './aiRoutes.js';
import { getDbStatus } from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const dbStatus = getDbStatus();
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    version: '1.0.0',
    service: 'Women Safety Shield API',
  }, 'System is fully operational');
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contacts', contactRoutes);
router.use('/emergencies', emergencyRoutes);
router.use('/journeys', journeyRoutes);
router.use('/location-sessions', locationRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/places', placesRoutes);
router.use('/assistant', aiRoutes);

export default router;
