import { createPools } from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pools:
 *   post:
 *     summary: Create new pools with the given pool IDs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               poolIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of pool IDs to create
 *             required:
 *               - poolIds
 *     responses:
 *       201:
 *         description: Pools created successfully
 *       400:
 *         description: Invalid poolIds format
 *       500:
 *         description: Internal server error
 */
router.post('/', createPools);

export default router;
