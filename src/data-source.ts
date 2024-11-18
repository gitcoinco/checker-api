import { DataSource } from 'typeorm';
import { env } from './env';

// Set default values for environment variables
const synchronize = env.SYNCHRONIZE?.toLowerCase() === 'true';
const logging = env.LOGGING?.toLowerCase() === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  synchronize,
  logging,
  entities: ['src/entity/*.ts'],
  migrations: ['src/migration/*.ts'],
  subscribers: ['src/subscriber/*.ts'],
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});
