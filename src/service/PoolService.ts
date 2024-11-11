import { type Pool } from '@/entity/Pool';
import { poolRepository } from '@/repository';

class PoolService {
  async savePool(pool: Partial<Pool>): Promise<Pool> {
    return await poolRepository.save(pool);
  }

  async getPoolById(id: number): Promise<Pool | null> {
    const pool = await poolRepository.findOne({ where: { id } });
    return pool;
  }

  async getPoolByPoolIdAndChainId(
    chainId: number,
    poolId: string
  ): Promise<Pool | null> {
    const pool = await poolRepository.findOne({
      where: { chainId, poolId },
    });
    return pool;
  }

  async upsertPool(chainId: number, poolId: string): Promise<Pool> {
    let pool = await this.getPoolByPoolIdAndChainId(chainId, poolId);
    if (pool == null) {
      pool = await this.savePool({
        chainId,
        poolId,
        questions: [],
        applications: [],
      });
    }
    return pool;
  }

  async getAllPools(): Promise<Pool[]> {
    return await poolRepository.find();
  }
}

const poolService = new PoolService();
export default poolService;
