import type { Request, Response } from 'express';
import { validateRequest } from '@/utils';
import type { ProjectApplicationForManager } from '@/ext/passport/types';
import { isVerified } from '@/ext/passport/credentialverification';

interface SocialCredentialBody {
  application: Partial<ProjectApplicationForManager>;
}

export const validateSocialCredential = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const { application } = req.body as SocialCredentialBody;

  console.log('application', req.body);

  try {
    const result = await isVerified(application);
    res.json({
      message: 'Social credential validated',
      provider: result,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error validating social credential' });
  }
};
