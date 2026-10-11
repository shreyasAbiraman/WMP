import { EmergencyIncident } from '../models/EmergencyIncident.js';
import { TrustedContact } from '../models/TrustedContact.js';
import { NotificationService } from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const triggerEmergency = async (req, res, next) => {
  try {
    const { incidentType, latitude, longitude, accuracy, address, emergencyDialerOpened } = req.body;
    const userId = req.user._id;

    // Check for an already active incident for this user
    const existingActive = await EmergencyIncident.findOne({
      userId,
      status: 'active',
    });

    if (existingActive) {
      // If coordinates are provided, update the active incident trail
      if (latitude && longitude) {
        existingActive.latestLocation = {
          latitude,
          longitude,
          accuracy: accuracy || 10,
          address: address || existingActive.latestLocation?.address || '',
          timestamp: new Date(),
        };
        existingActive.locationTrail.push({
          latitude,
          longitude,
          accuracy: accuracy || 10,
          recordedAt: new Date(),
        });
        await existingActive.save();
      }

      logger.warn(`Duplicate SOS trigger received for user ${userId}. Returning existing active incident ${existingActive.incidentId}`);
      return successResponse(res, { incident: existingActive, isDuplicate: true }, 'Active emergency incident already in progress', 200);
    }

    // Generate unique Incident ID
    const incidentId = `INC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const locationTrail = [];
    let latestLocation = null;

    if (latitude !== undefined && longitude !== undefined) {
      latestLocation = {
        latitude,
        longitude,
        accuracy: accuracy || 15,
        address: address || '',
        timestamp: new Date(),
      };
      locationTrail.push({
        latitude,
        longitude,
        accuracy: accuracy || 15,
        recordedAt: new Date(),
      });
    }

    // Retrieve user's trusted contacts
    const contacts = await TrustedContact.find({ userId }).sort({ priorityOrder: 1 });

    const incident = new EmergencyIncident({
      incidentId,
      userId,
      incidentType: incidentType || 'sos_button',
      status: 'active',
      latestLocation,
      locationTrail,
      emergencyDialerOpened: Boolean(emergencyDialerOpened),
      notifications: contacts.map((c) => ({
        contactId: c._id,
        name: c.name,
        phone: c.phoneNumber,
        channel: c.preferredNotifyMethod || 'sms',
        status: 'pending',
      })),
    });

    await incident.save();

    // Notify trusted contacts
    const dispatchResults = await NotificationService.sendEmergencyAlerts(incident, contacts, req.user);
    incident.notifications = dispatchResults;
    await incident.save();

    // Broadcast via Socket.IO if initialized
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('emergency:created', incident);
      io.emit('emergency:status', { incidentId, status: 'active', userId });
    }

    logger.emergency(`Emergency SOS created: ${incidentId} for user ${req.user.email}`);

    return successResponse(
      res,
      {
        incident,
        emergencyNumber: '112',
        instructions: 'Emergency SOS activated. Trusted contacts notified. Keep this screen open for live tracking or tap Call 112 for direct police assistance.',
      },
      'Emergency SOS activated successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getActiveIncident = async (req, res, next) => {
  try {
    const incident = await EmergencyIncident.findOne({
      userId: req.user._id,
      status: 'active',
    });

    return successResponse(res, { incident }, 'Active incident check');
  } catch (error) {
    next(error);
  }
};

export const getIncidents = async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [incidents, total] = await Promise.all([
      EmergencyIncident.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      EmergencyIncident.countDocuments(filter),
    ]);

    return successResponse(
      res,
      {
        incidents,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
      'Incident history retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getIncidentById = async (req, res, next) => {
  try {
    const incident = await EmergencyIncident.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!incident) {
      return errorResponse(res, 'Incident not found or unauthorized', 404);
    }

    return successResponse(res, { incident }, 'Incident details');
  } catch (error) {
    next(error);
  }
};

export const updateLocationTrail = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy } = req.body;

    const incident = await EmergencyIncident.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'active',
    });

    if (!incident) {
      return errorResponse(res, 'Active incident not found or already closed', 404);
    }

    incident.latestLocation = {
      latitude,
      longitude,
      accuracy: accuracy || 10,
      timestamp: new Date(),
    };

    incident.locationTrail.push({
      latitude,
      longitude,
      accuracy: accuracy || 10,
      recordedAt: new Date(),
    });

    // Cap trail to last 500 points to prevent document bloat
    if (incident.locationTrail.length > 500) {
      incident.locationTrail = incident.locationTrail.slice(-500);
    }

    await incident.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user._id}`).emit('location:update', {
        incidentId: incident.incidentId,
        location: incident.latestLocation,
      });
    }

    return successResponse(res, { incident }, 'Incident location updated');
  } catch (error) {
    next(error);
  }
};

export const resolveIncident = async (req, res, next) => {
  try {
    const { resolutionNotes } = req.body;

    const incident = await EmergencyIncident.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!incident) {
      return errorResponse(res, 'Incident not found or unauthorized', 404);
    }

    if (incident.status === 'resolved') {
      return successResponse(res, { incident }, 'Incident is already resolved');
    }

    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    incident.resolutionNotes = resolutionNotes || 'Resolved safely by user';
    await incident.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user._id}`).emit('emergency:status', {
        incidentId: incident.incidentId,
        status: 'resolved',
      });
    }

    logger.info(`Incident resolved: ${incident.incidentId}`);

    return successResponse(res, { incident }, 'Emergency incident marked as resolved');
  } catch (error) {
    next(error);
  }
};

export const acknowledgeAlert = async (req, res, next) => {
  try {
    const { contactName, note } = req.body;

    const incident = await EmergencyIncident.findOne({ incidentId: req.params.id });
    if (!incident) {
      return errorResponse(res, 'Incident not found', 404);
    }

    incident.acknowledgements.push({
      contactName,
      note: note || 'Acknowledged alert notification',
      acknowledgedAt: new Date(),
    });

    // Mark matching contact notification as acknowledged
    const match = incident.notifications.find((n) => n.name.toLowerCase() === contactName.toLowerCase());
    if (match) {
      match.status = 'acknowledged';
    }

    await incident.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${incident.userId}`).emit('contact:acknowledged', {
        incidentId: incident.incidentId,
        contactName,
        note,
      });
    }

    return successResponse(res, { incident }, 'Emergency acknowledgement recorded');
  } catch (error) {
    next(error);
  }
};
