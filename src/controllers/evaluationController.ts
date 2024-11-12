import type { Request, Response } from 'express';
import evaluationService, {
  type CreateEvaluationParams,
} from '@/service/EvaluationService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import { EVALUATOR_TYPE } from '@/entity/Evaluation';
import applicationService from '@/service/ApplicationService';
import poolService from '@/service/PoolService';

const logger = createLogger();

interface EvaluateApplicationBody extends CreateEvaluationParams {
  chainId: number;
}

export const evaluateApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const {
    poolId: alloPoolId,
    applicationId,
    cid,
    evaluator,
    summaryInput,
    chainId,
  }: EvaluateApplicationBody = req.body;

  logger.info(
    `Received evaluation request for applicationId: ${applicationId} in poolId: ${alloPoolId}`
  );

  const [errorFetching, application] = await catchError(
    applicationService.getApplicationByChainIdPoolIdApplicationId(
      alloPoolId.toString(),
      chainId,
      applicationId
    )
  );

  if (errorFetching !== null || application == null) {
    logger.warn(`No application found for applicationId: ${applicationId}`);
    res.status(404).json({ message: 'Application not found' });
    return;
  }

  const [errorGetPool, pool] = await catchError(
    poolService.getPoolByChainIdAndAlloPoolId(chainId, alloPoolId.toString())
  );

  if (errorGetPool !== null || pool == null) {
    logger.warn(`No pool found for poolId: ${alloPoolId}`);
    res.status(404).json({ message: 'Pool not found' });
    return;
  }

  // Call your service to create an evaluation with answers
  const [evaluationError, evaluation] = await catchError(
    evaluationService.createEvaluationWithAnswers({
      poolId: pool.id,
      applicationId,
      cid,
      evaluator,
      summaryInput,
      evaluatorType: EVALUATOR_TYPE.HUMAN,
    })
  );

  if (evaluationError !== undefined) {
    logger.error('Failed to create evaluation:', evaluationError);
    res.status(500).json({
      message: 'Error creating evaluation',
      error: evaluationError.message,
    });
    return;
  }

  if (evaluation == null) {
    logger.error('Failed to create evaluation:', evaluationError);
    res.status(500).json({
      message: 'Error creating evaluation',
      error: 'Evaluation is null',
    });
    return;
  }

  // Respond with the evaluation result
  logger.info(`Evaluation created for applicationId: ${applicationId}`);
  res.status(200).json({
    message: 'Evaluation successfully created',
    evaluationId: evaluation.id,
  });
};
