import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { addressFrom, catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import {
  indexerClient,
  type RoundWithApplications as IndexerRoundWithApplications,
} from '@/ext/indexer';
import applicationService from '@/service/ApplicationService';
import {
  type PromptEvaluationQuestions,
  requestEvaluationQuestions,
} from '@/ext/openai';
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

  const [errorFetching, indexerPoolData] = await catchError(
    indexerClient.getRoundWithApplications({
      chainId,
      roundId: alloPoolId,
    })
  );

  if (errorFetching != null || indexerPoolData == null) {
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
    requestEvaluationQuestions(indexerPoolData.roundMetadata)
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

  const applicationData = indexerPoolData.applications.map(application => ({
    alloApplicationId: application.id,
    profileId: application.projectId,
  }));

  await applicationService.upsertApplicationsForPool(
    alloPoolId,
    chainId,
    applicationData
  );

  await triggerLLMEvaluationByPool(
    alloPoolId,
    chainId,
    indexerPoolData,
    evaluationQuestions
  );

  logger.info('successfully synced pool', pool);
  res.status(200).json({ message: 'pool synced successfully' });
};

const triggerLLMEvaluationByPool = async (
  alloPoolId: string,
  chainId: number,
  indexerPoolData: IndexerRoundWithApplications,
  evaluationQuestions: PromptEvaluationQuestions
): Promise<void> => {
  const applicationsWithoutLLM =
    await applicationService.getApplicationsWithoutLLMEvalutionsByAlloPoolId(
      alloPoolId,
      chainId
    );
  // Filter and limit applications to prepare for evaluation parameters
  let applicationsForLLMReview = applicationsWithoutLLM
    .map(application =>
      indexerPoolData.applications.find(
        poolApplication => poolApplication.id === application.alloApplicationId
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
      alloApplicationId: poolApplication.id,
      cid: poolApplication.metadataCid,
      evaluator: addressFrom(1),
      roundMetadata: indexerPoolData.roundMetadata,
      applicationMetadata: poolApplication.metadata,
      questions: evaluationQuestions,
    }));

  if (evaluationParamsArray.length !== applicationsWithoutLLM.length) {
    logger.warn('Some applications were not found in indexerPoolData');
  }

  await createLLMEvaluations(evaluationParamsArray);
};
