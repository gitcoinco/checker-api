import { createLogger } from '@/logger/logger';

const logger = createLogger('utils.ts');

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
