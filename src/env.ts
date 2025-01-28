import dotenv from 'dotenv';
dotenv.config();

interface EnvVars {
  NODE_ENV: string;
  MAX_CONCURRENT_EVALUATIONS: number;
  EVALUATION_BATCH_SIZE: number;
  EVALUATION_BATCH_DELAY: number;
  [key: string]: string | number | undefined; // Allow other env vars
}

export const env: EnvVars = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  MAX_CONCURRENT_EVALUATIONS: Number(
    process.env.MAX_CONCURRENT_EVALUATIONS ?? 5
  ),
  EVALUATION_BATCH_SIZE: Number(process.env.EVALUATION_BATCH_SIZE ?? 25),
  EVALUATION_BATCH_DELAY: Number(process.env.EVALUATION_BATCH_DELAY ?? 2000),
  ...process.env,
};
