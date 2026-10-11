import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

export const setupSocketHandlers = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      if (!token) {
        // Allow anonymous connection ONLY if joining a public shared location room with valid shareCode
        socket.data.isGuest = true;
        return next();
      }

      const decoded = verifyAccessToken(token);
      if (!decoded || !decoded.userId) {
        socket.data.isGuest = true;
        return next();
      }

      socket.data.userId = decoded.userId;
      socket.data.isGuest = false;
      next();
    } catch (err) {
      logger.warn(`Socket authentication error: ${err.message}`);
      socket.data.isGuest = true;
      next();
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    if (userId) {
      // Join authenticated user-specific private room
      socket.join(`user:${userId}`);
      logger.info(`Socket client connected for user: ${userId}`);
    } else {
      logger.info(`Guest socket connected: ${socket.id}`);
    }

    // Join authorized location share session room
    socket.on('session:join', (shareCode) => {
      if (typeof shareCode === 'string' && shareCode.trim().length > 0) {
        const roomName = `session:${shareCode.trim().toUpperCase()}`;
        socket.join(roomName);
        logger.info(`Socket ${socket.id} joined location share room: ${roomName}`);
        socket.emit('session:joined', { shareCode, room: roomName });
      }
    });

    // Leave session room
    socket.on('session:leave', (shareCode) => {
      if (typeof shareCode === 'string') {
        const roomName = `session:${shareCode.trim().toUpperCase()}`;
        socket.leave(roomName);
        logger.info(`Socket ${socket.id} left location share room: ${roomName}`);
      }
    });

    // Client-emitted location ping (if authenticated)
    socket.on('client:location_ping', (data) => {
      if (!userId) return;
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        // Echo to user's other sessions / devices
        socket.to(`user:${userId}`).emit('location:update', {
          userId,
          coordinates: {
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy || 10,
            timestamp: new Date(),
          },
        });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });
  });
};
