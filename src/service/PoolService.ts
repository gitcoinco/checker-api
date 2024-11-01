import poolRepository from "@/repository/PoolRepository";
import { Pool } from "@/entity/Pool";

class PoolService {
  async create(data: Partial<Pool>): Promise<Pool> {
    const newPool = poolRepository.create(data); // Create a new Pool instance
    return await poolRepository.save(newPool); // Save it to the database
  }

  async findAll(): Promise<Pool[]> {
    return await poolRepository.find(); // Fetch all pools
  }

  async findById(id: number): Promise<Pool | null> {
    return await poolRepository.findOneBy({ id }); // Fetch a pool by ID
  }

  async update(id: number, data: Partial<Pool>): Promise<Pool | null> {
    await poolRepository.update(id, data); // Update the pool
    return await this.findById(id); // Return the updated pool
  }

  async delete(id: number): Promise<void> {
    await poolRepository.delete(id); // Delete the pool by ID
  }
}

const poolService = new PoolService();
export default poolService;
