import type { Request, Response } from 'express';
import evaluationService, {
  type CreateEvaluationParams,
} from '@/service/EvaluationService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import applicationService from '@/service/ApplicationService';
import poolService from '@/service/PoolService';
import {
  type PromptEvaluationQuestions,
  requestEvaluation,
} from '@/ext/openai';
import {
  type ApplicationMetadata,
  indexerClient,
  type RoundMetadata,
  type RoundWithApplications,
} from '@/ext/indexer';
import { EVALUATOR_TYPE } from '@/entity/Evaluation';
import { IsNullError, NotFoundError } from '@/errors';

const logger = createLogger();

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
    summaryInput,
    chainId,
  }: CreateEvaluationParams = req.body;

  logger.info(
    `Received evaluation request for alloApplicationId: ${alloApplicationId} in poolId: ${alloPoolId}`
  );

  const [errorFetching, application] = await catchError(
    applicationService.getApplicationByChainIdPoolIdApplicationId(
      alloPoolId,
      chainId,
      alloApplicationId
    )
  );

  if (errorFetching !== undefined || application === null) {
    logger.warn(
      `No application found for alloApplicationId: ${alloApplicationId}`
    );
    res.status(404).json({ message: 'Application not found' });
    return;
  }

  const [errorGetPool, pool] = await catchError(
    poolService.getPoolByChainIdAndAlloPoolId(chainId, alloPoolId)
  );

  if (errorGetPool !== undefined || pool == null) {
    logger.warn(`No pool found for poolId: ${alloPoolId}`);
    res.status(404).json({ message: 'Pool not found' });
    return;
  }

  const [evaluationError, evaluationResponse] = await catchError(
    createEvaluation({
      chainId,
      alloPoolId,
      alloApplicationId,
      cid,
      evaluator,
      summaryInput,
    })
  );

  if (evaluationError !== undefined || evaluationResponse === null) {
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
    evaluationId: evaluationResponse.id,
  });
};

// Second function to handle creating the evaluation and error checking
export const createEvaluation = async (
  params: CreateEvaluationParams
): Promise<any> => {
  // Create evaluation with answers
  const [evaluationError, evaluation] = await catchError(
    evaluationService.createEvaluationWithAnswers(params)
  );

  if (evaluationError !== undefined) {
    logger.error('Failed to create evaluation:', evaluationError);
    return { error: evaluationError };
  }

  if (evaluation == null) {
    logger.error('Failed to create evaluation: Evaluation is null');
    return { error: new IsNullError('Evaluation is null') };
  }

  return { evaluation };
};

export interface CreateLLMEvaluationParams {
  chainId: number;
  alloPoolId: string;
  applicationId: string;
  cid: string;
  evaluator: string;
  roundMetadata?: RoundMetadata;
  applicationMetadata?: ApplicationMetadata;
  questions?: PromptEvaluationQuestions;
}

export const createLLMEvaluations = async (
  paramsArray: CreateLLMEvaluationParams[]
): Promise<void> => {
  const roundCache: Record<string, RoundWithApplications> = {};
  const evaluationPromises = paramsArray.map(async params => {
    const evaluationQuestions =
      params.questions ??
      (await evaluationService.getQuestionsByChainAndAlloPoolId(
        params.chainId,
        params.alloPoolId
      ));

    if (evaluationQuestions == null) {
      logger.error('Failed to get evaluation questions');
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

        if (error !== undefined || fetchedRound == null) {
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
        app => app.id === params.applicationId
      );
      if (application == null) {
        logger.error(
          `Application with ID: ${params.applicationId} not found in round`
        );
        throw new NotFoundError(
          `Application with ID: ${params.applicationId} not found in round`
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
  });

  // Wait for all promises to resolve
  await Promise.all(evaluationPromises);
};
