import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import { type Pool } from '@/entity/Pool';

const logger = createLogger();

export const createPools = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  // TODO: wire in
  // const poolIds: string[] = req.body;
  // make indexer call to fetch pool
  const pools: Pool[] = [];

  // Call the service function to create a pool
  const [error, pool] = await catchError(poolService.createPools(pools));

  // Handle errors if any occurred during pool creation
  if (error !== undefined) {
    logger.error(`Error creating pool: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to create pool', error: error.message });
    return; // Exit early after sending the error response
  }

  // Successfully created the pool, log the success and send the response
  logger.info('Successfully created pool', pool);
  res.status(201).json({ message: 'Pool created successfully', pool });
};
