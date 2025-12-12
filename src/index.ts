import 'express-async-errors';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Logging
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});