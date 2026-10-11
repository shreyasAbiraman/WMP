import { User } from '../models/User.js';
import { TrustedContact } from '../models/TrustedContact.js';
import { EmergencyIncident } from '../models/EmergencyIncident.js';
import { Journey } from '../models/Journey.js';
import { Evidence } from '../models/Evidence.js';
import { Notification } from '../models/Notification.js';
import { LocationShareSession } from '../models/LocationShareSession.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, { user: user.toJSON() }, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, theme, preferences } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (theme) user.theme = theme;
    if (preferences) {
      user.preferences = {
        ...user.preferences.toObject(),
        ...preferences,
      };
    }

    await user.save();
    return successResponse(res, { user: user.toJSON() }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Current password does not match.', 400);
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return successResponse(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Cascade deletion of user-owned personal safety data
    await Promise.all([
      User.findByIdAndDelete(userId),
      TrustedContact.deleteMany({ userId }),
      EmergencyIncident.deleteMany({ userId }),
      Journey.deleteMany({ userId }),
      Evidence.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      LocationShareSession.deleteMany({ userId }),
    ]);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    logger.info(`User account and all personal safety data permanently deleted: ${userId}`);

    return successResponse(res, null, 'Account and all associated records permanently deleted');
  } catch (error) {
    next(error);
  }
};
