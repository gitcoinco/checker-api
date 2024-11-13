import { DataSource } from 'typeorm';

// Set default values for environment variables
const synchronize = Boolean(process.env.SYNCHRONIZE) || false;
const logging = Boolean(process.env.LOGGING) || false;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize,
  logging,
  entities: ['src/entity/*.ts'],
  migrations: ['src/migration/*.ts'],
  subscribers: ['src/subscriber/*.ts'],
});
