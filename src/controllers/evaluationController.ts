import type { Request, Response } from 'express';
import evaluationService, {
  type CreateEvaluationParams,
} from '@/service/EvaluationService';
import {
  addressFrom,
  catchError,
  isPoolManager,
  validateRequest,
} from '@/utils';
import { createLogger } from '@/logger';
import applicationService from '@/service/ApplicationService';
import poolService from '@/service/PoolService';
import {
  type PromptEvaluationQuestions,
  requestEvaluation,
  requestEvaluationQuestions,
} from '@/ext/openai';
import {
  type ApplicationMetadata,
  indexerClient,
  type RoundMetadata,
  type RoundWithApplications,
} from '@/ext/indexer';
import { type Evaluation, EVALUATOR_TYPE } from '@/entity/Evaluation';
import { IsNullError, NotFoundError } from '@/errors';
import { type Hex } from 'viem';
import type {
  PoolIdChainId,
  PoolIdChainIdApplicationId,
  PoolIdChainIdApplicationIdBody,
  PoolIdChainIdBody,
} from './types';
import evaluationQuestionService from '@/service/EvaluationQuestionService';
import { rateLimit } from 'express-rate-limit';

const logger = createLogger();

interface EvaluationBody extends CreateEvaluationParams {
  signature: Hex;
}

export const evaluationRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 requests per minute
  message: 'Too many evaluation requests',
});

export const recreateEvaluationQuestionsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // More restrictive for question recreation
  message: 'Too many question recreation requests',
});

export const triggerLLMEvaluationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 requests per minute
  message: 'Too many LLM evaluation requests',
});

export const recreateEvaluationQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { chainId, alloPoolId, signature } = req.body as PoolIdChainIdBody;

  const isAllowed = await isPoolManager<PoolIdChainId>(
    { alloPoolId, chainId },
    signature,
    chainId,
    alloPoolId
  );

  if (!isAllowed) {
    logger.warn(
      `User with address: ${signature} is not allowed to evaluate application`
    );
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  const [error, roundWithApplications] = await catchError(
    indexerClient.getRoundWithApplications({
      chainId,
      roundId: alloPoolId,
    })
  );

  if (
    error !== undefined ||
    roundWithApplications === undefined ||
    roundWithApplications?.roundMetadata === undefined
  ) {
    logger.error('Failed to fetch round with applications');
    res
      .status(404)
      .json({ message: 'Failed to fetch round with applications' });
    return;
  }

  const evaluationQuestions = await requestEvaluationQuestions(
    roundWithApplications.roundMetadata
  );

  if (evaluationQuestions === null || evaluationQuestions.length === 0) {
    logger.error('Failed to get evaluation questions');
    res.status(404).json({ message: 'Failed to get evaluation questions' });
    return;
  }

  const [errorReset] = await catchError(
    evaluationQuestionService.resetEvaluationQuestions(
      chainId,
      alloPoolId,
      evaluationQuestions
    )
  );

  if (errorReset !== undefined) {
    logger.error('Failed to reset evaluation questions', { errorReset });
    res.status(500).json({ message: 'Failed to reset evaluation questions' });
    return;
  }

  const [errorClean] = await catchError(evaluationService.cleanEvaluations());

  if (errorClean !== undefined) {
    logger.error('Failed to clean evaluations', { errorClean });
    res.status(500).json({ message: 'Failed to clean evaluations' });
    return;
  }

  res.status(200).json(evaluationQuestions);
};

export const evaluateApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const {
    alloPoolId,
    alloApplicationId,
    cid,
    evaluator,
    evaluationStatus,
    summaryInput,
    chainId,
    signature,
  }: EvaluationBody = req.body;

  logger.info(
    `Received evaluation request for alloApplicationId: ${alloApplicationId} in poolId: ${alloPoolId}`
  );

  const createEvaluationParams: CreateEvaluationParams = {
    chainId,
    alloPoolId,
    alloApplicationId,
    cid,
    evaluator,
    evaluationStatus,
    summaryInput,
  };

  const [isAllowedError, isAllowed] = await catchError(
    isPoolManager<CreateEvaluationParams>(
      createEvaluationParams,
      signature,
      chainId,
      alloPoolId
    )
  );

  if (isAllowedError !== undefined || isAllowed === undefined) {
    logger.warn(
      `User with address: ${evaluator} is not allowed to evaluate application`
    );
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  const [errorFetching, application] = await catchError(
    applicationService.getApplicationByChainIdPoolIdApplicationId(
      alloPoolId,
      chainId,
      alloApplicationId
    )
  );

  if (errorFetching !== undefined || application === undefined) {
    logger.warn(
      `No application found for alloApplicationId: ${alloApplicationId}`
    );
    res.status(404).json({ message: 'Application not found' });
    return;
  }

  const [errorGetPool, pool] = await catchError(
    poolService.getPoolByChainIdAndAlloPoolId(chainId, alloPoolId)
  );

  if (errorGetPool !== undefined || pool === undefined) {
    logger.warn(`No pool found for poolId: ${alloPoolId}`);
    res.status(404).json({ message: 'Pool not found' });
    return;
  }

  const [evaluationError, evaluationResponse] = await catchError(
    createEvaluation(createEvaluationParams)
  );

  if (evaluationError !== undefined || evaluationResponse === undefined) {
    logger.error(
      'Evaluation creation failed:',
      evaluationError ?? 'Unknown error'
    );
    res.status(500).json({
      message: 'Error creating evaluation',
      error: evaluationError?.message ?? 'Evaluation creation failed.',
    });
    return;
  }

  logger.info(`Evaluation created for alloApplicationId: ${alloApplicationId}`);
  res.status(200).json({
    message: 'Evaluation successfully created',
    evaluationId: evaluationResponse?.id,
  });
};

// Second function to handle creating the evaluation and error checking
export const createEvaluation = async (
  params: CreateEvaluationParams
): Promise<Evaluation> => {
  // Create evaluation with answers
  const [evaluationError, evaluation] = await catchError(
    evaluationService.createEvaluationWithAnswers(params)
  );

  if (evaluationError !== undefined || evaluation === undefined) {
    logger.error('Failed to create evaluation: Evaluation is null.undefined');
    throw new IsNullError('Evaluation is null/undefined');
  }

  return evaluation;
};

export interface CreateLLMEvaluationParams {
  chainId: number;
  alloPoolId: string;
  alloApplicationId: string;
  cid: string;
  evaluator: string;
  roundMetadata?: RoundMetadata;
  applicationMetadata?: ApplicationMetadata;
  questions?: PromptEvaluationQuestions;
}
export const triggerLLMEvaluation = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const { alloPoolId, chainId, alloApplicationId, signature } =
    req.body as PoolIdChainIdApplicationIdBody;

  const isAllowed = await isPoolManager<PoolIdChainIdApplicationId>(
    { alloPoolId, chainId, alloApplicationId },
    signature,
    chainId,
    alloPoolId
  );

  if (!isAllowed) {
    logger.warn(
      `User with address: ${signature} is not allowed to evaluate application`
    );
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  const questions = await evaluationService.getQuestionsByChainAndAlloPoolId(
    chainId,
    alloPoolId
  );

  const [errorFetching, indexerApplicationData] = await catchError(
    indexerClient.getApplicationWithRound({
      chainId,
      roundId: alloPoolId,
      applicationId: alloApplicationId,
    })
  );

  if (
    errorFetching !== undefined ||
    indexerApplicationData === undefined ||
    indexerApplicationData === null
  ) {
    logger.warn(
      `No pool found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
    );
    res.status(404).json({ message: 'Pool not found on indexer' });
    throw new NotFoundError(`Pool not found on indexer`);
  }

  const data: CreateLLMEvaluationParams = {
    chainId,
    alloPoolId,
    alloApplicationId,
    cid: indexerApplicationData.metadataCid,
    evaluator: addressFrom(1),
    roundMetadata: indexerApplicationData.round.roundMetadata,
    applicationMetadata: indexerApplicationData.metadata,
    questions,
  };

  const [error] = await catchError(createLLMEvaluations([data]));
  if (error !== undefined) {
    logger.error('Failed to create evaluations:', error);
    res.status(500).json({
      message: 'Failed to create evaluations',
      error: error.message,
    });
  }

  logger.info('LLM evaluation triggered successfully');
  res.status(200).json({ message: 'LLM evaluation triggered successfully' });
};

const batchPromises = <T>(array: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};

export const createLLMEvaluations = async (
  paramsArray: CreateLLMEvaluationParams[]
): Promise<string[]> => {
  const roundCache: Record<string, RoundWithApplications> = {};
  const failedProjects: string[] = [];

  // Increase batch size and add delay between batches
  const BATCH_SIZE = 25;
  const BATCH_DELAY = 2000; // 2 seconds between batches

  // Deduplicate params array based on unique application IDs
  const uniqueParams = paramsArray.filter(
    (param, index, self) =>
      index ===
      self.findIndex(
        p =>
          p.alloApplicationId === param.alloApplicationId &&
          p.chainId === param.chainId
      )
  );

  const batchedParams = batchPromises(uniqueParams, BATCH_SIZE);

  for (const batch of batchedParams) {
    try {
      // Process batch with concurrency limit
      await Promise.all(
        batch.map(async params => {
          await processSingleEvaluation(params, roundCache, failedProjects);
        })
      );

      // Add delay between batches to prevent overwhelming the system
      if (batchedParams.indexOf(batch) < batchedParams.length - 1) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    } catch (batchError) {
      logger.error('Error processing batch:', batchError);
      continue;
    }
  }

  return failedProjects;
};

async function processSingleEvaluation(
  params: CreateLLMEvaluationParams,
  roundCache: Record<string, RoundWithApplications>,
  failedProjects: string[]
): Promise<void> {
  try {
    const evaluationQuestions =
      params.questions === undefined || params.questions.length === 0
        ? await evaluationService.getQuestionsByChainAndAlloPoolId(
            params.chainId,
            params.alloPoolId
          )
        : params.questions;

    if (evaluationQuestions === null || evaluationQuestions.length === 0) {
      logger.error('createLLMEvaluations:Failed to get evaluation questions');
      throw new Error('Failed to get evaluation questions');
    }

    let roundMetadata = params.roundMetadata;
    let applicationMetadata = params.applicationMetadata;

    // Check if the round is already in cache
    if (roundMetadata == null || applicationMetadata == null) {
      let round: RoundWithApplications | null;

      // If the round is cached, use it
      if (roundCache[params.alloPoolId] != null) {
        round = roundCache[params.alloPoolId];
        logger.debug(
          `Using cached round data for roundId: ${params.alloPoolId}`
        );
      } else {
        // Fetch the round and store it in the cache
        const [error, fetchedRound] = await catchError(
          indexerClient.getRoundWithApplications({
            chainId: params.chainId,
            roundId: params.alloPoolId,
          })
        );

        if (
          error !== undefined ||
          fetchedRound === undefined ||
          fetchedRound === null
        ) {
          logger.error('Failed to fetch round with applications');
          throw new Error('Failed to fetch round with applications');
        }

        round = fetchedRound;
        roundCache[params.alloPoolId] = round;
        logger.info(
          `Fetched and cached round with ID: ${round.id}, which includes ${round.applications.length} applications`
        );
      }

      const application = round.applications.find(
        app => app.id === params.alloApplicationId
      );
      if (application == null) {
        logger.error(
          `Application with ID: ${params.alloApplicationId} not found in round`
        );
        throw new NotFoundError(
          `Application with ID: ${params.alloApplicationId} not found in round`
        );
      }

      roundMetadata = round.roundMetadata;
      applicationMetadata = application.metadata;
    }

    const evaluation = await requestEvaluation(
      roundMetadata,
      applicationMetadata,
      evaluationQuestions
    );

    await createEvaluation({
      chainId: params.chainId,
      alloPoolId: params.alloPoolId,
      alloApplicationId: params.alloApplicationId,
      cid: params.cid,
      evaluator: params.evaluator,
      summaryInput: evaluation,
      evaluatorType: EVALUATOR_TYPE.LLM_GPT3,
    });
  } catch (error) {
    failedProjects.push(params.alloApplicationId);
    throw error;
  }
}
