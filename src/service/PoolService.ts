import { type Pool } from '@/entity/Pool';
import poolRepository from '@/repository/PoolRepository';

class PoolService {
  async createTestPool(): Promise<Pool> {
    return await poolRepository.save({
      chainId: 111551111,
      poolId: Math.floor(Math.random() * 100).toString(),
      strategy: 'DummyStrategy',
      isReviewActive: true,
    });
  }

  async createPool(pool: Pool): Promise<Pool> {
    return await poolRepository.save(pool);
  }

  // async getPoolById(id: number): Promise<Pool> {
  //   return await poolRepository.findOne(id);
  // }

  async getAllPools(): Promise<Pool[]> {
    return await poolRepository.find();
  }

  // async updatePool(pool: Pool): Promise<Pool> {
  //   return await poolRepository.save(pool);
  // }

  // async deletePool(id: number): Promise<void> {
  //   await poolRepository.delete(id);
  // }
}

const poolService = new PoolService();
export default poolService;
