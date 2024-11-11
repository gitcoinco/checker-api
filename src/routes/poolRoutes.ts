import {
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

export default router;
