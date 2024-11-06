import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { EvaluationQuestion } from '@/entity/EvalutionQuestion';
import { Evaluation } from '@/entity/Evaluation';

export enum AnswerType {
  YES = 'yes',
  NO = 'no',
  UNCERTAIN = 'uncertain',
}

@Entity()
export class EvaluationAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AnswerType,
  })
  answer: AnswerType;

  @OneToMany(() => Evaluation, evaluation => evaluation.id)
  evaluation: Evaluation;

  @OneToOne(() => EvaluationQuestion, question => question.id)
  question: EvaluationQuestion;
}
