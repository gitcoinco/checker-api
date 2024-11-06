import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  Unique,
  ManyToOne,
} from 'typeorm';
import { EvaluationQuestion } from '@/entity/EvalutionQuestion';
import { Evaluation } from '@/entity/Evaluation';

export enum AnswerType {
  YES = 'yes',
  NO = 'no',
  UNCERTAIN = 'uncertain',
}

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

  @OneToMany(() => Evaluation, evaluation => evaluation.evaluationAnswer)
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
