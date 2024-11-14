import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { addressFrom, catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import { indexerClient } from '@/ext/indexer';
import applicationService from '@/service/ApplicationService';
import { requestEvaluationQuestions } from '@/ext/openai';
import evaluationQuestionService from '@/service/EvaluationQuestionService';
import {
  type CreateLLMEvaluationParams,
  createLLMEvaluations,
} from './evaluationController';

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

  const [evalError, evaluationQuestions] = await catchError(
    requestEvaluationQuestions(poolData.roundMetadata)
  );

  if (evalError != null || evaluationQuestions == null) {
    logger.error(
      `Error requesting evaluation questions: ${evalError?.message}`
    );
    res.status(500).json({
      message: 'Error requesting evaluation questions',
      error: evalError?.message,
    });
    return;
  }

  await evaluationQuestionService.resetEvaluationQuestions(
    chainId,
    alloPoolId,
    evaluationQuestions
  );

  const applicationData = poolData.applications.map(application => ({
    alloApplicationId: application.id,
    profileId: application.projectId,
  }));

  const insertedApplications =
    await applicationService.upsertApplicationsForPool(
      alloPoolId,
      chainId,
      applicationData
    );

  // Filter and limit applications to prepare for evaluation parameters
  let applicationsForLLMReview = insertedApplications
    .map(application =>
      poolData.applications.find(
        poolApp => poolApp.id === application.alloApplicationId
      )
    )
    .filter(poolApplication => poolApplication !== undefined); // Removes any undefined results

  if (process.env.NODE_ENV === 'development') {
    applicationsForLLMReview = applicationsForLLMReview.slice(0, 2); // Limit to first 2 applications in dev
  }

  // Map filtered applications to evaluation parameters
  const evaluationParamsArray: CreateLLMEvaluationParams[] =
    applicationsForLLMReview.map(poolApplication => ({
      chainId,
      alloPoolId,
      applicationId: poolApplication.id, // TODO: CHECK
      cid: poolApplication.metadataCid,
      evaluator: addressFrom(1),
      roundMetadata: poolData.roundMetadata,
      applicationMetadata: poolApplication.metadata,
      questions: evaluationQuestions,
    }));

  if (evaluationParamsArray.length !== insertedApplications.length) {
    logger.warn('Some applications were not found in poolData');
  }

  await createLLMEvaluations(evaluationParamsArray);

  logger.info('successfully synced pool', pool);
  res.status(200).json({ message: 'pool synced successfully' });
};
