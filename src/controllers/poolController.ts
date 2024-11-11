import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import { indexer } from '@/ext/indexer';
import applicationService from '@/service/ApplicationService';

const logger = createLogger();

interface PoolIdChainId {
  poolId: string;
  chainId: number;
}

export const createPool = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const { chainId, poolId } = req.body as PoolIdChainId;

  logger.info(
    `Received update request for chainId: ${chainId}, poolId: ${poolId}`
  );

  const [errorFetching, poolData] = await catchError(
    indexer.getRoundWithApplications({
      chainId,
      roundId: poolId,
    })
  );

  if (errorFetching != null || poolData == null) {
    logger.warn(`No pool found for chainId: ${chainId}, poolId: ${poolId}`);
    res.status(404).json({ message: 'Pool not found on indexer' });
    return;
  }

  const [error, pool] = await catchError(
    poolService.upsertPool(chainId, poolId)
  );
  if (error != null) {
    logger.error(`Failed to upsert pool: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Error upserting pool', error: error.message });
    return;
  }

  // TODO: handle questions

  const applicationData = poolData.applications.map(application => ({
    applicationId: application.id,
    profileId: application.id, // TODO: should be anchor address or project Id
  }));

  await applicationService.upsertApplicationsForPool(
    poolId,
    chainId,
    applicationData
  );

  logger.info('Successfully updated pool', pool);
  res.status(200).json({ message: 'Pool updated successfully', pool });
};
