import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { addressFrom, catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import { indexer } from '@/ext/indexer';
import applicationService from '@/service/ApplicationService';
import { requestEvaluation, requestEvaluationQuestions } from '@/ext/openai';
import evaluationQuestionService from '@/service/EvaluationQuestionService';
import evaluationService from '@/service/Evaluation';
import { EVALUATOR_TYPE } from '@/entity/Evaluation';

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
    indexer.getRoundWithApplications({
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
    applicationId: application.id,
    profileId: application.projectId,
  }));

  const insertedApplications =
    await applicationService.upsertApplicationsForPool(
      alloPoolId,
      chainId,
      applicationData
    );

  if (pool !== undefined) {
    // todo: should we fetch all applications without llm evaluation instead?
    for (const [index, application] of insertedApplications.entries()) {
      const poolApplication = poolData.applications.find(
        a => a.id === application.applicationId
      );

      if (poolApplication == null) {
        logger.warn(
          'No application found for applicationId',
          application.applicationId
        );
        return;
      }

      // todo: remove, just for dev purposes, will be too expensive
      if (index >= 10) {
        logger.info('Skipping application', index);
        break;
      }

      const evaluation = await requestEvaluation(
        poolData.roundMetadata,
        poolApplication.metadata,
        evaluationQuestions
      );

      await evaluationService.createEvaluationWithAnswers(
        pool.id,
        poolApplication.id,
        poolApplication.metadataCid,
        addressFrom(1),
        evaluation,
        EVALUATOR_TYPE.LLM_GPT3
      );
      logger.info('Inserted application', index, application);
    }
  }
  logger.info('successfully synced pool', pool);
  res.status(200).json({ message: 'pool synced successfully' });
};
