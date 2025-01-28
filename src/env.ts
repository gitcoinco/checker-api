import dotenv from 'dotenv';
dotenv.config();

// todo: add validation
export const env = {
  ...process.env,
  MAX_CONCURRENT_EVALUATIONS: Number(
    process.env.MAX_CONCURRENT_EVALUATIONS ?? 5
  ),
  EVALUATION_BATCH_SIZE: Number(process.env.EVALUATION_BATCH_SIZE ?? 25),
  EVALUATION_BATCH_DELAY: Number(process.env.EVALUATION_BATCH_DELAY ?? 2000),
} as const;
