import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/apiResponse.js';
import { User } from '../models/User.js';

export const authenticateJwt = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. No token provided.', 401);
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return errorResponse(res, 'Invalid or expired session. Please log in again.', 401);
    }

    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return errorResponse(res, 'User account no longer exists.', 401);
    }

    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Authentication verification error', 401, error.message);
  }
};
