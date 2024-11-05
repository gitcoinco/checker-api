import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Application } from './Application';
import { EvaluationAnswer } from './EvaluationAnswer';

export enum EVALUATOR_TYPE {
  HUMAN = 'human',
  LLM_GPT3 = 'llm_gpt3',
}

@Entity()
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Application, application => application.evaluations)
  application: Application;

  @Column()
  evaluator: string;

  @Column({
    type: 'enum',
    enum: EVALUATOR_TYPE,
  })
  evaluatorType: EVALUATOR_TYPE;

  @Column()
  summary: string;

  @OneToMany(() => EvaluationAnswer, answer => answer.evaluation)
  answers: EvaluationAnswer[];
}
