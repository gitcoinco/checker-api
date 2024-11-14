import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { addressFrom, catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import {
  indexerClient,
  type RoundWithApplications as IndexerRoundWithApplications,
  type RoundMetadata as IndexerRoundMetadata,
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
import { type Pool } from '@/entity/Pool';
import { IsNullError, NotFoundError } from '@/errors';

const logger = createLogger();

interface PoolIdChainId {
  alloPoolId: string;
  chainId: number;
  skipEvaluation?: boolean;
}

/**
 * Synchronizes a pool by fetching data from the indexer, updating the pool, handling evaluation questions,
 * updating applications, and triggering LLM evaluation if applicable.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const syncPool = async (req: Request, res: Response): Promise<void> => {
  // Validate the incoming request
  validateRequest(req, res);

  // Extract chainId and alloPoolId from the request body
  const { chainId, alloPoolId, skipEvaluation } = req.body as PoolIdChainId;

  // Log the receipt of the update request
  logger.info(
    `Received update request for chainId: ${chainId}, alloPoolId: ${alloPoolId}, skipEvaluation: ${skipEvaluation}`
  );

  // ---- Fetch pool data from the indexer ----
  const [errorFetching, indexerPoolData] = await catchError(
    indexerClient.getRoundWithApplications({
      chainId,
      roundId: alloPoolId,
    })
  );

  // Handle errors or missing data from the indexer
  if (errorFetching != null || indexerPoolData == null) {
    logger.warn(
      `No pool found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
    );
    res.status(404).json({ message: 'Pool not found on indexer' });
    throw new NotFoundError(`Pool not found on indexer`);
  }

  // ---- Get or create the pool ----
  // Upsert the pool with the fetched data
  const [error, pool] = await catchError(
    poolService.upsertPool(chainId, alloPoolId)
  );

  // Handle errors during the upsert operation
  if (error != null || pool == null) {
    logger.error(`Failed to upsert pool: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error upserting pool', error: error?.message });
    throw new IsNullError(`Error upserting pool`);
  }

  // ---- LLM evaluation questions ----
  // Fetch evaluation questions from the pool or request new questions
  const [evalQuestionsError, evaluationQuestions] = await catchError(
    handlePoolEvaluationQuestions(pool, indexerPoolData.roundMetadata)
  );

  // Handle errors during the evaluation question handling
  if (evalQuestionsError != null || evaluationQuestions == null) {
    res.status(500).json({
      message: 'Error handling evaluation questions',
      error: evalQuestionsError?.message,
    });
    throw new IsNullError(`Error handling evaluation questions`);
  }

  // ---- Update Applications ----
  // Update the pool with the applications from the indexer
  await updateApplications(chainId, alloPoolId, indexerPoolData);

  // ---- LLM evaluation ----
  // Trigger LLM evaluation for the pool if there are applications without evaluations
  if (skipEvaluation !== true)
    await triggerLLMEvaluationByPool(
      alloPoolId,
      chainId,
      indexerPoolData,
      evaluationQuestions
    );
  // Log success and respond to the request
  logger.info('successfully synced pool', pool);
  res.status(200).json({ message: 'pool synced successfully' });
};

const handlePoolEvaluationQuestions = async (
  pool: Pool,
  poolMetadata: IndexerRoundMetadata
): Promise<PromptEvaluationQuestions> => {
  if (pool.questions.length > 0) {
    return pool.questions.map(question => question.question);
  }

  const [evalError, evaluationQuestions] = await catchError(
    requestEvaluationQuestions(poolMetadata)
  );

  if (evalError != null || evaluationQuestions == null) {
    logger.error(
      `Error requesting evaluation questions: ${evalError?.message}`
    );
    throw new Error(
      `Error requesting evaluation questions ${evalError?.message}`
    );
  }

  await evaluationQuestionService.resetEvaluationQuestions(
    pool.chainId,
    pool.alloPoolId,
    evaluationQuestions
  );

  return evaluationQuestions;
};

const updateApplications = async (
  chainId: number,
  alloPoolId: string,
  indexerPoolData: IndexerRoundWithApplications
): Promise<void> => {
  const applicationData = indexerPoolData.applications.map(application => ({
    alloApplicationId: application.id,
    profileId: application.projectId,
  }));

  await applicationService.upsertApplicationsForPool(
    alloPoolId,
    chainId,
    applicationData
  );
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

