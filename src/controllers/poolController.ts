import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError } from '@/utils';
import { createLogger } from '@/logger';

const logger = createLogger('PoolController.ts');

export const getAllPools = async (
  req: Request,
  res: Response
): Promise<void> => {
  logger.info('Received request to get all pools');
  const [error, pools] = await catchError(poolService.getAllPools());

  if (error !== undefined) {
    logger.error(`Error fetching pools: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to fetch pools', error: error.message });
  }

  logger.info(`Successfully fetched ${pools?.length} pools`);
  res.json({ pools });
};

export const createTestPool = async (
  req: Request,
  res: Response
): Promise<void> => {
  logger.info('Received request to create test pool');
  const [error, pool] = await catchError(poolService.createTestPool());

  if (error !== undefined) {
    logger.error(`Error creating pool: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to create pool', error: error.message });
  }

  logger.info(`Successfully created pool with ID: ${pool?.id}`);
  res.json({
    message: 'Pool Created',
    pool,
  });
};
