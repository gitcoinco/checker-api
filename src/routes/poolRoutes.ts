import { createLogger } from '@/logger/logger';
import poolService from '@/service/PoolService';
import { catchError } from '@/utils';
import { Router } from 'express';

const logger = createLogger('poolRoutes.ts');
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
  logger.info('Received request to get all pools');
  const [error, pools] = await catchError(poolService.getAllPools());

  if (error !== undefined) {
    logger.error(`Error fetching pools: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to fetch pools', error: error.message });
  }

  logger.info(`Successfully fetched ${pools?.length} pools`);
  res.json({
    pools,
  });
});

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
router.post('/create-test', async (req, res) => {
  logger.info('Received request to create test pool');
  const [error, pool] = await catchError(poolService.createTestPool());

  if (error !== undefined) {
    logger.error(`Error creating pool: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to create pool', error: error.message });
  }

  logger.info(`Successfully created pool with ID: ${pool?.id}`);
  res.json({
    message: 'Pool Created',
    pool,
  });
});

export default router;
