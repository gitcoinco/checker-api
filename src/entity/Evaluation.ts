import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Unique,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Application } from '@/entity/Application';
import { EvaluationAnswer } from '@/entity/EvaluationAnswer';

export enum EVALUATOR_TYPE {
  HUMAN = 'human',
  LLM_GPT3 = 'llm_gpt3', // evaluator: address(1)
}

@Entity()
@Unique(['evaluator', 'applicationId'])
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 42 })
  evaluator: string;

  @Column({
    type: 'enum',
    enum: EVALUATOR_TYPE,
  })
  evaluatorType: EVALUATOR_TYPE;

  @Column()
  summary: string;

  @Column()
  evaluatorScore: number;

  @Column()
  metadataCid: string;

  @ManyToOne(() => Application, application => application.evaluations)
  application: Application;

  @OneToMany(
    () => EvaluationAnswer,
    evaluationAnswer => evaluationAnswer.evaluation
  )
  evaluationAnswer: EvaluationAnswer[];

  @Column() // Explicitly define the foreign key column for application
  applicationId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  lastUpdatedAt: Date;
}
