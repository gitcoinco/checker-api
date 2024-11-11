import { getApplicationsByProfileId } from '@/controllers/profileController';
import { Router } from 'express';

const router = Router();

/**
 * profile/{profileId}/applications:
 *   get:
 *     summary: Retrieves all applications associated with a specific profile ID
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         description: The unique ID of the profile
 *         schema:
 *           type: string
 *           example: "profile123"
 *     responses:
 *       200:
 *         description: A list of applications associated with the profile
 *       404:
 *         description: Applications not found for the specified profile
 */
router.get('/:profileId/applications', getApplicationsByProfileId);

export default router;
