import type { Request, Response } from 'express';
import { createLogger } from '@/logger';
import { catchError, validateRequest } from '@/utils';
import profileService from '@/service/ProfileService';

const logger = createLogger();

export const getApplicationsByProfileId = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const profileId = req.params.profileId;

  logger.info(
    `Received request to get applications for profile ID: ${profileId}`
  );
  const [error, applications] = await catchError(
    profileService.getApplicationsByProfileId(profileId)
  );

  if (error !== undefined) {
    logger.error(`Error fetching applications: ${error.message}`);
    res
      .status(404)
      .json({ message: 'Applications not found', error: error.message });
  }

  logger.info(`Successfully fetched ${applications?.length} applications`);
  res.json({ applications });
};
