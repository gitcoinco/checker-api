import poolService from '@/service/PoolService';
import { catchError } from '@/utils';
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
router.get('/', async (req, res) => {
  const [error, pools] = await catchError(poolService.getAllPools());

  if (error !== undefined) {
    res
      .status(500)
      .json({ message: 'Failed to fetch pools', error: error.message });
  }

  res.json({
    pools,
  });
});

/**
 * @swagger
 * /create-test:
 *   post:
 *     summary: Creates a test pool
 *     responses:
 *       201:
 *         description: Pool created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/create-test', async (req, res) => {
  const [error, pool] = await catchError(poolService.createTestPool());

  if (error !== undefined) {
    res
      .status(500)
      .json({ message: 'Failed to create pool', error: error.message });
  }

  res.json({
    message: 'Pool Created',
    pool,
  });
});

export default router;
