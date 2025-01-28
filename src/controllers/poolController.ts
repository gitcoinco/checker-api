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
import { env } from '@/env';
import { rateLimit } from 'express-rate-limit';
import { throttle } from 'lodash';

const logger = createLogger();

interface PoolIdChainId {
  alloPoolId: string;
  chainId: number;
  skipEvaluation?: boolean;
}

// Create a map to store ongoing sync operations
const syncOperations = new Map<string, Promise<string[]>>();

// Rate limiter middleware
export const syncPoolRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many sync requests, please try again later',
});

interface SyncPoolParams {
  chainId: number;
  alloPoolId: string;
  skipEvaluation?: boolean;
}

// Throttled sync function with proper types
const throttledSync = throttle(
  async (params: SyncPoolParams): Promise<string[]> => {
    const key = `${params.chainId}-${params.alloPoolId}`;

    // If there's already a sync operation in progress for this pool, return it
    if (syncOperations.has(key)) {
      const existingOperation = syncOperations.get(key);
      if (existingOperation !== undefined) {
        return await existingOperation;
      }
    }

    const syncPromise = (async () => {
      try {
        // ---- Fetch pool data from the indexer ----
        const [errorFetching, indexerPoolData] = await catchError(
          indexerClient.getRoundWithApplications({
            chainId: params.chainId,
            roundId: params.alloPoolId,
          })
        );

        // Handle errors or missing data from the indexer
        if (errorFetching != null || indexerPoolData == null) {
          logger.warn(
            `No pool found for chainId: ${params.chainId}, alloPoolId: ${params.alloPoolId}`
          );
          throw new NotFoundError(`Pool not found on indexer`);
        }

        // ---- Get or create the pool ----
        const [error, pool] = await catchError(
          poolService.upsertPool(params.chainId, params.alloPoolId)
        );

        // Handle errors during the upsert operation
        if (error != null || pool == null) {
          logger.error(`Failed to upsert pool: ${error?.message}`);
          throw new IsNullError(`Error upserting pool`);
        }

        // ---- LLM evaluation questions ----
        const [evalQuestionsError, evaluationQuestions] = await catchError(
          handlePoolEvaluationQuestions(pool, indexerPoolData.roundMetadata)
        );

        // Handle errors during the evaluation question handling
        if (evalQuestionsError != null || evaluationQuestions == null) {
          throw new IsNullError(`Error handling evaluation questions`);
        }

        // ---- Update Applications ----
        await updateApplications(
          params.chainId,
          params.alloPoolId,
          indexerPoolData
        );

        // ---- LLM evaluation ----
        let failedProjects: string[] = [];
        if (params.skipEvaluation !== true) {
          failedProjects = await triggerLLMEvaluationByPool(
            params.alloPoolId,
            params.chainId,
            indexerPoolData,
            evaluationQuestions
          );
        }
        return failedProjects;
      } finally {
        syncOperations.delete(key);
      }
    })();

    syncOperations.set(key, syncPromise);
    return await syncPromise;
  },
  5000
); // Throttle to one call per 5 seconds

/**
 * Synchronizes a pool by fetching data from the indexer, updating the pool, handling evaluation questions,
 * updating applications, and triggering LLM evaluation if applicable.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const syncPool = async (req: Request, res: Response): Promise<void> => {
  validateRequest(req, res);
  const { chainId, alloPoolId, skipEvaluation } = req.body as PoolIdChainId;

  try {
    const failedProjects = await throttledSync({
      chainId,
      alloPoolId,
      skipEvaluation,
    });

    if (failedProjects.length > 0) {
      logger.info('Pool synced successfully with some projects failing', {
        failedProjects,
      });
      res.status(207).json({
        success: true,
        message: 'Pool synced successfully, with some projects failing.',
        failedProjects,
      });
    } else {
      logger.info('Successfully synced pool');
      res.status(200).json({
        success: true,
        message: 'Pool synced successfully.',
      });
    }
  } catch (error) {
    logger.error('Error syncing pool:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({
        message: 'Error syncing pool',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

const handlePoolEvaluationQuestions = async (
  pool: Pool,
  poolMetadata: IndexerRoundMetadata
): Promise<PromptEvaluationQuestions> => {
  const questions =
    await evaluationQuestionService.getEvaluationQuestionsByAlloPoolId(
      pool.alloPoolId,
      pool.chainId
    );

  if (questions.length > 0) {
    return questions.map(question => question.question);
  }

  // Retry logic
  let retries = 5;
  let evalError;
  let evaluationQuestions: undefined | PromptEvaluationQuestions;

  while (retries > 0) {
    [evalError, evaluationQuestions] = await catchError(
      requestEvaluationQuestions(poolMetadata)
    );

    if (evalError == null && evaluationQuestions != null) {
      break;
    }

    retries--;
    if (retries > 0) {
      logger.warn(
        `Retrying evaluation question request. Attempts remaining: ${retries}`
      );
    }
  }

  if (evaluationQuestions === undefined) {
    logger.error(
      `Error requesting evaluation questions after 5 attempts: ${evalError?.message}`
    );
    throw new Error(
      `Error requesting evaluation questions: ${evalError?.message}`
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
): Promise<string[]> => {
  // Get applications without LLM evaluations
  const applicationsWithoutLLM =
    await applicationService.getApplicationsWithoutLLMEvalutionsByAlloPoolId(
      alloPoolId,
      chainId
    );

  if (applicationsWithoutLLM.length === 0) {
    logger.info('No applications require LLM evaluation');
    return [];
  }

  // Create a map for quick lookup - O(n) once vs O(n) for each find operation
  const pendingApplicationsMap = new Map(
    applicationsWithoutLLM.map(app => [app.alloApplicationId, app])
  );

  // Filter indexer applications to only those needing evaluation - O(1) per item vs O(n) per item with find()
  const applicationsForLLMReview = indexerPoolData.applications.filter(app =>
    pendingApplicationsMap.has(app.id)
  );

  // Development environment limit
  const maxApplications = env.NODE_ENV === 'development' ? 5 : undefined;
  const limitedApplications = applicationsForLLMReview.slice(
    0,
    maxApplications
  );

  // Prepare evaluation parameters with pre-loaded data
  const evaluationParamsArray: CreateLLMEvaluationParams[] =
    limitedApplications.map(poolApplication => ({
      chainId,
      alloPoolId,
      alloApplicationId: poolApplication.id,
      cid: poolApplication.metadataCid,
      evaluator: addressFrom(1),
      roundMetadata: indexerPoolData.roundMetadata,
      applicationMetadata: poolApplication.metadata,
      questions: evaluationQuestions,
    }));

  if (evaluationParamsArray.length === 0) {
    return [];
  }

  logger.info(
    `Triggering LLM evaluation for ${evaluationParamsArray.length} applications`
  );

  const failedProjects = await createLLMEvaluations(evaluationParamsArray);
  return failedProjects;
};
