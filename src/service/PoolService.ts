import { type Pool } from '@/entity/Pool';
import { poolRepository } from '@/repository';

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

  async getPoolById(id: number): Promise<Pool> {
    const pool = await poolRepository.findOne({ where: { id } });
    if (pool == null) {
      throw new Error(`Pool with id ${id} not found`);
    }
    return pool;
  }

  async getPoolByPoolIdAndChainId(
    chainId: number,
    poolId: string
  ): Promise<Pool> {
    const pool = await poolRepository.findOne({
      where: { chainId, poolId },
    });
    if (pool == null) {
      throw new Error(`Pool with poolId ${pool} on ${chainId} not found`);
    }
    return pool;
  }

  async getAllPools(): Promise<Pool[]> {
    return await poolRepository.find();
  }

  // async updatePool(pool: Pool): Promise<Pool> {
  //   return await poolRepository.save(pool);
  // }
}

const poolService = new PoolService();
export default poolService;
