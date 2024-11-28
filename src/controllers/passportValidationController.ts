import type { Request, Response } from 'express';
import { validateRequest } from '@/utils';
import type { ProjectApplicationForManager } from '@/ext/passport/types';
import { isVerified } from '@/ext/passport/credentialverification';

interface SocialCredentialBody {
  provider: 'twitter' | 'github';
  application: Partial<ProjectApplicationForManager>;
}

export const validateSocialCredential = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const { provider, application } = req.body as SocialCredentialBody;

  res.json({
    message: 'Social credential validated',
    verified: await isVerified(provider, application),
  });
};
