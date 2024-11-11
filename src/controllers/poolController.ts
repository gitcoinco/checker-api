import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import { indexer } from '@/ext/indexer';
import type { Pool } from '@/entity/Pool';
import { poolRepository } from '@/repository';

const logger = createLogger();

interface PoolIdChainId {
  poolId: string;
  chainId: string;
}

export const createPool = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const { chainId, poolId } = req.body as PoolIdChainId;
  let error: Error | undefined;
  let updatedPool: Pool | undefined;

  logger.info(
    `Received update request for chainId: ${chainId}, poolId: ${poolId}`
  );

  try {
    const pool = await indexer.getRoundWithApplications({
      chainId: parseInt(chainId, 10),
      roundId: poolId,
    });

    if (pool == null) {
      logger.warn(`No pool found for chainId: ${chainId}, poolId: ${poolId}`);
      res.status(404).json({ message: 'Pool not found' });
      return;
    }

    const existingPool = await poolRepository.findOne({
      where: {
        chainId: pool.chainId,
        poolId: pool.id,
      },
    });

    if (existingPool?.id != null) {
      // todo: handle existing pool
      logger.warn(
        `Pool already exists for chainId: ${chainId}, poolId: ${poolId}`
      );
      res.status(409).json({ message: 'Pool already exists' });
      return;
    } else {
      // todo: add some question magic here
      [error, updatedPool] = await catchError(
        poolService.savePool({
          chainId: pool.chainId,
          poolId: pool.id,
          questions: [],
          applications: [],
        })
      );
    }

    if (error !== undefined) {
      logger.error(`Error updating pool: ${error.message}`);
      res
        .status(500)
        .json({ message: 'Failed to update pool', error: error.message });
      return;
    }

    logger.info('Successfully updated pool', updatedPool);
    res
      .status(200)
      .json({ message: 'Pool updated successfully', pool: updatedPool });
  } catch (error) {
    logger.error(`Error updating pool: ${error}`);
    res
      .status(500)
      .json({ message: 'Failed to update pool', error: error.message });
  }
};

// export const createPools = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   validateRequest(req, res);

//   // TODO: wire in
//   // const poolIds: string[] = req.body;
//   // make indexer call to fetch pool
//   const pools: Pool[] = [];

//   // Call the service function to create a pool
//   const [error, pool] = await catchError(poolService.savePools(pools));

//   // Handle errors if any occurred during pool creation
//   if (error !== undefined) {
//     logger.error(`Error creating pool: ${error.message}`);
//     res
//       .status(500)
//       .json({ message: 'Failed to create pool', error: error.message });
//     return; // Exit early after sending the error response
//   }

//   // Successfully created the pool, log the success and send the response
//   logger.info('Successfully created pool', pool);
//   res.status(201).json({ message: 'Pool created successfully', pool });
// };
