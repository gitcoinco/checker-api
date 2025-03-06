import type { Request, Response } from 'express';
import { catchError, validateRequest } from '@/utils';
import type { ProjectApplicationForManager } from '@/ext/passport/types';
import { isVerified } from '@/ext/passport/credentialverification';
import { createLogger } from '@/logger';

interface SocialCredentialBody {
  application: Partial<ProjectApplicationForManager>;
}

const logger = createLogger();

export const validateSocialCredential = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const { application } = req.body as SocialCredentialBody;

  const [error, result] = await catchError(isVerified(application));
  if (error !== undefined) {
    logger.error('Failed to validate social credential:', error);
    res.status(400).json({ message: 'Error validating social credential' });
    return;
  }

  logger.info('Social credential validated', { result });
  res.json({
    message: 'Social credential validated',
    provider: result,
  });
};
