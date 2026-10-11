import { LocationShareSession } from '../models/LocationShareSession.js';
import { generateSecureToken } from '../utils/hash.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const startLocationSession = async (req, res, next) => {
  try {
    const { title, durationMinutes, initialCoordinates } = req.body;
    const userId = req.user._id;

    // Check if there is an existing active session, terminate it before starting a fresh one
    await LocationShareSession.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, endedAt: new Date() } }
    );

    const sessionId = `LOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const shareCode = generateSecureToken(8).toUpperCase();
    const duration = durationMinutes || 60;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const locationTrail = [];
    if (initialCoordinates) {
      locationTrail.push({
        latitude: initialCoordinates.latitude,
        longitude: initialCoordinates.longitude,
        accuracy: initialCoordinates.accuracy || 10,
        recordedAt: new Date(),
      });
    }

    const session = await LocationShareSession.create({
      sessionId,
      userId,
      shareCode,
      title: title || 'Live Safety Location Share',
      expiresAt,
      currentLocation: initialCoordinates
        ? {
            latitude: initialCoordinates.latitude,
            longitude: initialCoordinates.longitude,
            accuracy: initialCoordinates.accuracy || 10,
            timestamp: new Date(),
          }
        : undefined,
      locationTrail,
    });

    return successResponse(res, { session }, 'Location sharing started', 201);
  } catch (error) {
    next(error);
  }
};

export const getActiveSession = async (req, res, next) => {
  try {
    const session = await LocationShareSession.findOne({
      userId: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    return successResponse(res, { session }, 'Active session check');
  } catch (error) {
    next(error);
  }
};

export const getSessionByShareCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const session = await LocationShareSession.findOne({
      shareCode: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).populate('userId', 'fullName');

    if (!session) {
      return errorResponse(res, 'Location sharing session is expired or invalid.', 404);
    }

    return successResponse(res, { session }, 'Session details retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateCoordinates = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    const session = await LocationShareSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true,
    });

    if (!session) {
      return errorResponse(res, 'Active sharing session not found', 404);
    }

    const now = new Date();
    session.currentLocation = {
      latitude,
      longitude,
      accuracy: accuracy || 10,
      timestamp: now,
    };

    session.locationTrail.push({
      latitude,
      longitude,
      accuracy: accuracy || 10,
      recordedAt: now,
    });

    if (session.locationTrail.length > 200) {
      session.locationTrail = session.locationTrail.slice(-200);
    }

    await session.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`session:${session.shareCode}`).emit('location:update', {
        shareCode: session.shareCode,
        coordinates: session.currentLocation,
      });
      io.to(`user:${req.user._id}`).emit('location:update', {
        coordinates: session.currentLocation,
      });
    }

    return successResponse(res, { session }, 'Location coordinates updated');
  } catch (error) {
    next(error);
  }
};

export const stopLocationSession = async (req, res, next) => {
  try {
    const session = await LocationShareSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isActive: false, endedAt: new Date() } },
      { new: true }
    );

    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`session:${session.shareCode}`).emit('location:status', {
        shareCode: session.shareCode,
        isActive: false,
      });
    }

    return successResponse(res, { session }, 'Location sharing stopped successfully');
  } catch (error) {
    next(error);
  }
};
