import { createLogger } from '@/logger';
import { type Request, type Response } from 'express';
import { validationResult } from 'express-validator';

const logger = createLogger();

export const catchError = async <T>(
  promise: Promise<T>
): Promise<[Error | undefined, T | undefined]> => {
  try {
    const data = await promise;
    return [undefined, data];
  } catch (error) {
    logger.error(`catchError: Error occurred: ${error.message}`, {
      stack: error.stack,
    });
    return [error as Error, undefined];
  }
};

export const validateRequest = (req: Request, res: Response): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation failed', { errors: errors.array() });
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
};
