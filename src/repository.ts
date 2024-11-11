import { AppDataSource } from '@/data-source';
import { Pool } from '@/entity/Pool';
import { Application } from '@/entity/Application';
import { Evaluation } from '@/entity/Evaluation';
import { EvaluationAnswer } from '@/entity/EvaluationAnswer';
import { EvaluationQuestion } from '@/entity/EvaluationQuestion';
import { Profile } from '@/entity/Profile';

// Export repositories for each entity
export const poolRepository = AppDataSource.getRepository(Pool);
export const applicationRepository = AppDataSource.getRepository(Application);
export const evaluationRepository = AppDataSource.getRepository(Evaluation);
export const evaluationAnswerRepository =
  AppDataSource.getRepository(EvaluationAnswer);
export const evaluationQuestionRepository =
  AppDataSource.getRepository(EvaluationQuestion);
export const profileRepository = AppDataSource.getRepository(Profile);
