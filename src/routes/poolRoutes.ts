import { syncPool } from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pools:
 *   post:
 *     summary: Syncs a pool with the given poolId and chainId from the indexer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool to create
 *                 example: "609"
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 42161
 *               skipEvaluation:
 *                 type: boolean
 *                 description: Skip evaluation of the pool
 *                 example: true
 *             required:
 *               - alloPoolId
 *               - chainId
 *     responses:
 *       201:
 *         description: Pool synced successfully
 *       207:
 *         description: Pool synced successfully, with some projects failing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Pool synced successfully, with some projects failing.
 *                 failedProjects:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "0xprojectId1"
 *       400:
 *         description: Invalid poolId or chainId format
 *       500:
 *         description: Internal server error
 */
router.post('/', syncPool);

export default router;
