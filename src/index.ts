import express from 'express';
import { AppDataSource } from '@/data-source';
import poolService from './service/PoolService';
import { catchError } from './utils';

const app = express();

AppDataSource.initialize()
  .then(() => {
    console.log('Connected to database!');
  })
  .catch(error => {
    console.log('Error connecting to database:', error);
  });

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

app.post('/test-pool', async (req, res) => {
  const [error, pool] = await catchError(poolService.createTestPool());

  if (error !== undefined) {
    res.status(500).json({ message: 'Failed to create pool' });
  }

  res.json({
    message: 'Pool Created',
    pool,
  });
});

app.get('/pools', async (req, res) => {
  const [error, pools] = await catchError(poolService.getAllPools());

  if (error !== undefined) {
    res.status(500).json({ message: 'Failed to fetch pool' });
  }

  res.json({
    pools,
  });
});
