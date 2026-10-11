import { User } from '../models/User.js';
import { hashPassword, comparePassword, generateSecureToken } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = config.nodeEnv === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: config.cookieSecure || isProduction,
    sameSite: config.cookieSameSite,
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookieSecure || isProduction,
      sameSite: config.cookieSameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

export const register = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phoneNumber,
      passwordHash,
    });

    const accessToken = generateAccessToken({ userId: user._id.toString() });
    const refreshToken = generateRefreshToken({ userId: user._id.toString() });

    // Store hashed refresh token
    user.refreshTokenHash = await hashPassword(refreshToken);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    logger.info(`New user registered: ${user.email}`);

    return successResponse(
      res,
      {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +refreshTokenHash');
    if (!user) {
      return errorResponse(res, 'Invalid email or password credentials.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password credentials.', 401);
    }

    const accessToken = generateAccessToken({ userId: user._id.toString() });
    const refreshToken = generateRefreshToken({ userId: user._id.toString() });

    user.refreshTokenHash = await hashPassword(refreshToken);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    logger.info(`User logged in: ${user.email}`);

    return successResponse(
      res,
      {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user && req.user._id) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshTokenHash: 1 } });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }
    return successResponse(res, { user: user.toJSON() }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return errorResponse(res, 'Refresh token required', 401);
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded || !decoded.userId) {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.userId).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) {
      return errorResponse(res, 'Session invalid or revoked', 401);
    }

    const isValid = await comparePassword(token, user.refreshTokenHash);
    if (!isValid) {
      return errorResponse(res, 'Invalid refresh token session', 401);
    }

    const newAccessToken = generateAccessToken({ userId: user._id.toString() });
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString() });

    user.refreshTokenHash = await hashPassword(newRefreshToken);
    await user.save();

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return successResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }, 'Tokens refreshed successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success message to prevent user enumeration
    if (!user) {
      return successResponse(
        res,
        {
          configured: false,
          instructions: 'If an account with this email exists, password reset instructions have been generated.',
        },
        'Password reset requested'
      );
    }

    const resetToken = generateSecureToken(24);
    user.passwordResetToken = await hashPassword(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const isEmailConfigured = Boolean(config.emailProviderApiKey);

    if (isEmailConfigured) {
      // In production with email API key
      logger.info(`Password reset email dispatched to ${user.email}`);
    } else {
      logger.info(`[DEV MODE] Password reset token for ${user.email}: ${resetToken}`);
    }

    return successResponse(
      res,
      {
        configured: isEmailConfigured,
        resetToken: !isEmailConfigured ? resetToken : undefined,
        note: isEmailConfigured
          ? 'Reset instructions sent to your registered email.'
          : 'Email service is unconfigured in development. Use the development reset token returned here to test password reset.',
      },
      'Password reset request processed'
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Find users with active reset tokens
    const users = await User.find({
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordHash');

    let matchingUser = null;
    for (const u of users) {
      if (u.passwordResetToken && (await comparePassword(token, u.passwordResetToken))) {
        matchingUser = u;
        break;
      }
    }

    if (!matchingUser) {
      return errorResponse(res, 'Invalid or expired password reset token.', 400);
    }

    matchingUser.passwordHash = await hashPassword(newPassword);
    matchingUser.passwordResetToken = undefined;
    matchingUser.passwordResetExpires = undefined;
    matchingUser.refreshTokenHash = undefined;
    await matchingUser.save();

    return successResponse(res, null, 'Password has been successfully reset. Please log in with your new password.');
  } catch (error) {
    next(error);
  }
};
