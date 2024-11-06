import { AppDataSource } from '@/data-source';
import { Pool } from '@/entity/Pool';

const poolRepository = AppDataSource.getRepository(Pool);

export default poolRepository;
