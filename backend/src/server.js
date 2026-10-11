import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});

app.set('io', io);
setupSocketHandlers(io);

// Security & utility middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching frontend
      if (!origin || origin === config.frontendUrl || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply global rate limiting to all requests
app.use(globalLimiter);

// API v1 routes
app.use('/api/v1', apiRoutes);

// Root greeting / health redirect
app.get('/', (req, res) => {
  res.json({
    name: 'Women Safety Shield API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server if not running inside a test runner
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server.listen(config.port, () => {
      logger.info(`Women Safety Shield Backend running on http://localhost:${config.port}`);
      logger.info(`Frontend URL authorized: ${config.frontendUrl}`);
    });
  });
}

export { app, server, io };
