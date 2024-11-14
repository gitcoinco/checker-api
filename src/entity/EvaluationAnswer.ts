import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Unique,
  ManyToOne,
} from 'typeorm';
import { EvaluationQuestion } from '@/entity/EvaluationQuestion';
import { Evaluation } from '@/entity/Evaluation';

export enum AnswerType {
  YES = 'yes',
  NO = 'no',
  UNCERTAIN = 'uncertain',
}

export const toAnswerType = (value: number): AnswerType => {
  const mapping: Record<number, AnswerType> = {
    0: AnswerType.YES,
    1: AnswerType.NO,
    2: AnswerType.UNCERTAIN,
  };

  if (mapping[value] !== undefined) {
    return mapping[value];
  }
  throw new Error(`Invalid value for AnswerType: ${value}`);
};

@Entity()
@Unique(['evaluationId', 'evaluationQuestionId'])
export class EvaluationAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AnswerType,
  })
  answer: AnswerType;

  @ManyToOne(() => Evaluation, evaluation => evaluation.evaluationAnswer)
  evaluation: Evaluation;

  @ManyToOne(
    () => EvaluationQuestion,
    evaluationQuestion => evaluationQuestion.answers
  )
  evaluationQuestion: EvaluationQuestion;

  @Column() // Explicitly define the foreign key column for evaluation
  evaluationId: number;

  @Column() // Explicitly define the foreign key column for question
  evaluationQuestionId: number;
}
