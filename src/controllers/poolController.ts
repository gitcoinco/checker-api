import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import { indexerClient } from '@/ext/indexer';
import applicationService from '@/service/ApplicationService';

const logger = createLogger();

interface PoolIdChainId {
  alloPoolId: string;
  chainId: number;
}

export const syncPool = async (req: Request, res: Response): Promise<void> => {
  validateRequest(req, res);

  const { chainId, alloPoolId } = req.body as PoolIdChainId;

  logger.info(
    `Received update request for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
  );

  const [errorFetching, poolData] = await catchError(
    indexerClient.getRoundWithApplications({
      chainId,
      roundId: alloPoolId,
    })
  );

  if (errorFetching != null || poolData == null) {
    logger.warn(
      `No pool found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
    );
    res.status(404).json({ message: 'Pool not found on indexer' });
    return;
  }

  const [error, pool] = await catchError(
    poolService.upsertPool(chainId, alloPoolId)
  );

  if (error != null) {
    logger.error(`Failed to upsert pool: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Error upserting pool', error: error.message });
    return;
  }

  // TODO: fetch questions from gpt
  // evaluationQuestionService.resetEvaluationQuestions(chainId, alloPoolId, poolData.questions);

  const applicationData = poolData.applications.map(application => ({
    applicationId: application.id,
    profileId: application.projectId,
  }));

  await applicationService.upsertApplicationsForPool(
    alloPoolId,
    chainId,
    applicationData
  );

  logger.info('successfully synced pool', pool);
  res.status(200).json({ message: 'pool synced successfully' });
};
