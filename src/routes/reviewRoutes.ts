import { reviewApplication } from '@/controllers/reviewController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /review/:
 *   get:
 *     summary: Welcome API
 *     responses:
 *       200:
 *         description: Welcome to the Review API
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Review API',
  });
});

/**
 * @swagger
 * /review/{chainId}/{poolId}/{applicationId}:
 *   get:
 *     summary: Logs the input parameters (chainId, poolId, applicationId)
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         description: The chainId of the pool
 *         schema:
 *           type: string
 *         example: 42161
 *       - in: path
 *         name: poolId
 *         required: true
 *         description: The poolId of the pool
 *         schema:
 *           type: string
 *         example: 608
 *       - in: path
 *         name: applicationId
 *         required: true
 *         description: The applicationId of the pool
 *         schema:
 *           type: string
 *         example: 47
 *     responses:
 *       200:
 *         description: Successfully logged the input parameters
 */
router.get('/:chainId/:poolId/:applicationId', reviewApplication);

export default router;
