import express from 'express';
import { AppDataSource } from '@/data-source';
import poolService from './service/PoolService';

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
  await poolService.createTestPool();
  res.send('Pool saved');
});
