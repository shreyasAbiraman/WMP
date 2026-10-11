import { Journey } from '../models/Journey.js';
import { TrustedContact } from '../models/TrustedContact.js';
import { NotificationService } from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const startJourney = async (req, res, next) => {
  try {
    const { destination, startLocation, expectedDurationMinutes, checkInIntervalMinutes, selectedContacts } = req.body;
    const userId = req.user._id;

    // Check if there is an active journey
    const existingActive = await Journey.findOne({ userId, status: 'active' });
    if (existingActive) {
      return errorResponse(res, 'You already have an active Safe Journey in progress. Please complete or cancel it first.', 400);
    }

    const journeyId = `JRN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const expectedArrival = new Date(now.getTime() + expectedDurationMinutes * 60 * 1000);
    const nextCheckIn = new Date(now.getTime() + (checkInIntervalMinutes || 15) * 60 * 1000);

    const journey = await Journey.create({
      journeyId,
      userId,
      destination,
      startLocation,
      expectedDurationMinutes,
      checkInIntervalMinutes: checkInIntervalMinutes || 15,
      expectedArrivalTime: expectedArrival,
      lastCheckInTime: now,
      nextCheckInDue: nextCheckIn,
      selectedContacts: selectedContacts || [],
      lastKnownLocation: startLocation
        ? {
            latitude: startLocation.latitude,
            longitude: startLocation.longitude,
            accuracy: 10,
            timestamp: now,
          }
        : undefined,
      checkInHistory: [
        {
          timestamp: now,
          type: 'manual',
          note: 'Journey started',
          location: startLocation ? { latitude: startLocation.latitude, longitude: startLocation.longitude } : undefined,
        },
      ],
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('journey:status', { journeyId, status: 'active' });
    }

    logger.info(`Safe Journey started: ${journeyId} to ${destination.name}`);

    return successResponse(res, { journey }, 'Safe Journey started successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getActiveJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findOne({
      userId: req.user._id,
      status: { $in: ['active', 'overdue'] },
    }).populate('selectedContacts');

    return successResponse(res, { journey }, 'Active journey check');
  } catch (error) {
    next(error);
  }
};

export const getJourneys = async (req, res, next) => {
  try {
    const journeys = await Journey.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(25)
      .populate('selectedContacts');

    return successResponse(res, { journeys }, 'Journey history retrieved');
  } catch (error) {
    next(error);
  }
};

export const getJourneyById = async (req, res, next) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('selectedContacts');

    if (!journey) {
      return errorResponse(res, 'Journey not found', 404);
    }

    return successResponse(res, { journey }, 'Journey details');
  } catch (error) {
    next(error);
  }
};

export const checkInJourney = async (req, res, next) => {
  try {
    const { latitude, longitude, note } = req.body;
    const now = new Date();

    const journey = await Journey.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: { $in: ['active', 'overdue'] },
    });

    if (!journey) {
      return errorResponse(res, 'Active journey not found or already closed', 404);
    }

    journey.lastCheckInTime = now;
    journey.nextCheckInDue = new Date(now.getTime() + journey.checkInIntervalMinutes * 60 * 1000);
    journey.status = 'active'; // reset overdue state if was overdue

    if (latitude && longitude) {
      journey.lastKnownLocation = {
        latitude,
        longitude,
        accuracy: 10,
        timestamp: now,
      };
      journey.routeTrail.push({
        latitude,
        longitude,
        timestamp: now,
      });
    }

    journey.checkInHistory.push({
      timestamp: now,
      type: 'manual',
      note: note || 'Safe check-in confirmed',
      location: latitude && longitude ? { latitude, longitude } : undefined,
    });

    await journey.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user._id}`).emit('journey:status', {
        journeyId: journey.journeyId,
        status: 'checked_in',
        lastCheckInTime: journey.lastCheckInTime,
        nextCheckInDue: journey.nextCheckInDue,
      });
    }

    return successResponse(res, { journey }, 'Safety check-in recorded successfully');
  } catch (error) {
    next(error);
  }
};

export const completeJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: { $in: ['active', 'overdue'] },
    });

    if (!journey) {
      return errorResponse(res, 'Active journey not found', 404);
    }

    journey.status = 'completed';
    journey.completedAt = new Date();
    journey.checkInHistory.push({
      timestamp: new Date(),
      type: 'arrival',
      note: 'Destination reached safely',
    });

    await journey.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user._id}`).emit('journey:status', {
        journeyId: journey.journeyId,
        status: 'completed',
      });
    }

    return successResponse(res, { journey }, 'Journey successfully completed! Glad you arrived safely.');
  } catch (error) {
    next(error);
  }
};

export const cancelJourney = async (req, res, next) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: { $in: ['active', 'overdue'] },
    });

    if (!journey) {
      return errorResponse(res, 'Active journey not found', 404);
    }

    journey.status = 'cancelled';
    journey.cancelledAt = new Date();
    await journey.save();

    return successResponse(res, { journey }, 'Journey cancelled');
  } catch (error) {
    next(error);
  }
};
