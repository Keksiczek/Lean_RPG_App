import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Input validation failed',
      details: (err as ZodError).flatten(),
    });
  }

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
  });
};