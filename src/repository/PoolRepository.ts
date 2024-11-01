import { AppDataSource } from "@/datasource";
import { Pool } from "@/entity/Pool";

const poolRepository = AppDataSource.getRepository(Pool);

export default poolRepository;
