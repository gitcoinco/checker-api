import { createTestPool, getAllPools } from '@/controllers/poolController';
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
