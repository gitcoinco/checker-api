import {
  createTestPool,
  getAllPools,
  getPoolById,
  getPoolByPoolIdAndChainId,
} from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pools:
 *   get:
 *     summary: Retrieves all pools
 *     responses:
 *       200:
 *         description: A list of pools
 */
router.get('/', getAllPools);

/**
 * @swagger
 * /pools/{id}:
 *   get:
 *     summary: Retrieves a pool by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the pool
 *         schema:
 *           type: string
 *         example: 1
 *     responses:
 *       200:
 *         description: A pool object
 *       404:
 *         description: Pool not found
 */
router.get('/:id', getPoolById);

/**
 * /pools/{chainId}/{poolId}:
 *   get:
 *     summary: Retrieves a pool by chainId and poolId
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         description: The chainId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: poolId
 *         required: true
 *         description: The poolId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: A pool object
 *       404:
 *         description: Pool not found
 */
router.get('/:chainId/:poolId', getPoolByPoolIdAndChainId);

/**
 * /pools/{chainId}/{poolId}/applications:
 *   get:
 *     summary: Retrieves all applications for a pool
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         description: The chainId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: poolId
 *         required: true
 *         description: The poolId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: A list of applications
 *       404:
 *         description: Applications not found
 */
// router.get('/:chainId/:poolId/applications', getApplicationsByPool);

/**
 * /pools/{chainId}/{poolId}/applications/{applicationId}:
 *   get:
 *     summary: Retrieves an application by applicationId
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         description: The chainId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: poolId
 *         required: true
 *         description: The poolId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: applicationId
 *         required: true
 *         description: The applicationId of the application
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: An application object
 *       404:
 *         description: Application not found
 */
// router.get('/:chainId/:poolId/applications/:applicationId', getApplicationByApplicationId);

/**
 * /pools/{chainId}/{poolId}/applications/{applicationId}/evaluations:
 *   get:
 *     summary: Retrieves evaluations for a specific application
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         description: The chainId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: poolId
 *         required: true
 *         description: The poolId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: applicationId
 *         required: true
 *         description: The applicationId of the application
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: A list of evaluations
 *       404:
 *         description: Evaluations not found
 */
// router.get('/:chainId/:poolId/applications/:applicationId/evaluations', getApplicationEvaluations);

/**
 * /pools/{chainId}/{poolId}/applications/{applicationId}/evaluations/{evaluator}:
 *   get:
 *     summary: Retrieves an evaluation by a specific evaluator for an application
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         description: The chainId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: poolId
 *         required: true
 *         description: The poolId of the pool
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: applicationId
 *         required: true
 *         description: The applicationId of the application
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: path
 *         name: evaluator
 *         required: true
 *         description: The ID of the evaluator
 *         schema:
 *           type: string
 *           example: "evaluator123"
 *     responses:
 *       200:
 *         description: An evaluation object
 *       404:
 *         description: Evaluation not found
 */
// router.get('/:chainId/:poolId/applications/:applicationId/evaluations/:evaluator', getApplicationEvaluationByEvaluator);

/**
 * @swagger
 * /pools/create-test:
 *   post:
 *     summary: Creates a test pool
 *     responses:
 *       201:
 *         description: Pool created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/create-test', createTestPool);

export default router;
