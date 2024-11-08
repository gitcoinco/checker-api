import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { createLogger } from '@/logger';
import { indexer } from '@/ext/indexer';
import { requestEvaluation } from '@/ext/openai';
import e from 'express';

const logger = createLogger('evaluateController.ts');

export const evaluateApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.error('Validation failed', { errors: errors.array() });
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { chainId, poolId, applicationId } = req.params;

  logger.info(
    `Received evaluate request for chainId: ${chainId}, poolId: ${poolId}, applicationId: ${applicationId}`
  );

  try {
    const application = await indexer.getApplication({
      roundId: poolId,
      chainId: parseInt(chainId, 10),
      applicationId,
    });

    if (application !== null) {
      logger.info(
        `Successfully fetched application with ID: ${application.id}`
      );

      const evaluationResult = await requestEvaluation(application);

      res.status(200).json({
        message: 'Successfully evaluated application',
        data: evaluationResult,
      });
    } else {
      logger.info(`No application found for ID: ${applicationId}`);
      res.status(404).json({
        message: 'Application not found',
        data: { chainId, poolId, applicationId },
      });
    }
  } catch (error) {
    logger.error('Error evaluating application', { error });
    res.status(500).json({
      message: 'Error evaluating application',
      error: error.message,
    });
  }
};