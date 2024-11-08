import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';

const logger = createLogger();

export const getAllPools = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  logger.info('Received request to get getAllPools');
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

export const getPoolById = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  logger.info('Received request to get pool by ID');
  const id = Number(req.params.id);
  const [error, pool] = await catchError(poolService.getPoolById(id));

  if (error !== undefined) {
    logger.error(`Error fetching pool: ${error.message}`);
    res.status(404).json({ message: 'Pool not found', error: error.message });
  }

  logger.info(`Successfully fetched pool with ID: ${id}`);
  res.json({ pool });
};

export const getPoolByPoolIdAndChainId = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  logger.info('Received request to get pool by chainId and poolId');
  const chainId = Number(req.params.chainId);
  const poolId = req.params.poolId;
  const [error, pool] = await catchError(
    poolService.getPoolByPoolIdAndChainId(chainId, poolId)
  );

  if (error !== undefined) {
    logger.error(`Error fetching pool: ${error.message}`);
    res.status(404).json({ message: 'Pool not found', error: error.message });
  }

  logger.info(`Successfully fetched pool with ID: ${poolId}`);
  res.json({ pool });
};

export const createTestPool = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

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
