import { createPool } from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pools:
 *   post:
 *     summary: Create a new pool with the given poolId and chainId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               poolId:
 *                 type: string
 *                 description: The ID of the pool to create
 *                 example: "609"  # Example of poolId
 *               chainId:
 *                 type: string
 *                 description: The chain ID associated with the pool
 *                 example: "42161"  # Example of chainId (Arbitrum)
 *             required:
 *               - poolId
 *               - chainId
 *     responses:
 *       201:
 *         description: Pool created successfully
 *       400:
 *         description: Invalid poolId or chainId format
 *       500:
 *         description: Internal server error
 *     examples:
 *       application/json:
 *         - value:
 *             poolId: "609"
 *             chainId: "42161"
 */
router.post('/', createPool);

export default router;
