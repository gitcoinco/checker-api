import dotenv from 'dotenv';
dotenv.config();

interface EnvVars {
  NODE_ENV: string;
  MAX_CONCURRENT_EVALUATIONS: number;
  EVALUATION_BATCH_SIZE: number;
  EVALUATION_BATCH_DELAY: number;
  DATABASE_URL: string;
  SYNCHRONIZE: string;
  LOGGING: string;
  INDEXER_URL: string;
  OPENAI_API_KEY: string;
  [key: string]: string | number | undefined;
}

export const env: EnvVars = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  MAX_CONCURRENT_EVALUATIONS: Number(
    process.env.MAX_CONCURRENT_EVALUATIONS ?? 5
  ),
  EVALUATION_BATCH_SIZE: Number(process.env.EVALUATION_BATCH_SIZE ?? 25),
  EVALUATION_BATCH_DELAY: Number(process.env.EVALUATION_BATCH_DELAY ?? 2000),
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  SYNCHRONIZE: process.env.SYNCHRONIZE ?? 'false',
  LOGGING: process.env.LOGGING ?? 'false',
  INDEXER_URL: process.env.INDEXER_URL ?? '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  ...process.env,
};
