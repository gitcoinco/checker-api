import { evaluateApplication } from '@/controllers/evaluationController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /evaluations/{chainId}/{poolId}/{applicationId}:
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
router.get('/:chainId/:poolId/:applicationId/evaluate', evaluateApplication);

/**
 * /evaluations/evaluator/{evaluator}:
 *   get:
 *     summary: Retrieves all evaluations by a specific evaluator
 *     parameters:
 *       - in: path
 *         name: evaluator
 *         required: true
 *         description: The address of the evaluator
 *         schema:
 *           type: string
 *           example: "0x1234567890123456789012345678901234567890"
 *     responses:
 *       200:
 *         description: A list of evaluations by the evaluator
 *       404:
 *         description: Evaluations not found for the specified evaluator
 */
// router.get('/evaluator/:evaluator', getEvaluationsByEvaluator);

/**
 * /evaluations/{evaluationById}:
 *   get:
 *     summary: Retrieves a specific evaluation by its ID
 *     parameters:
 *       - in: path
 *         name: evaluationById
 *         required: true
 *         description: The unique ID of the evaluation
 *         schema:
 *           type: string
 *           example: "evaluation123"
 *     responses:
 *       200:
 *         description: An evaluation object
 *       404:
 *         description: Evaluation not found
 */
// router.get('/:evaluationById', getEvaluationById);

export default router;
