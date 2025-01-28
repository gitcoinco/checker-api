import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Unique,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Application } from '@/entity/Application';
import { EvaluationAnswer } from '@/entity/EvaluationAnswer';

export enum EVALUATOR_TYPE {
  HUMAN = 'human',
  LLM_GPT3 = 'llm_gpt3', // evaluator: address(1)
}

export enum EVALUATION_STATUS {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNCERTAIN = 'uncertain',
}

@Entity()
@Index(['evaluator', 'evaluatorType'])
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

  @Index()
  @Column({
    type: 'enum',
    enum: EVALUATION_STATUS,
  })
  evaluationStatus: EVALUATION_STATUS;

  @Column()
  metadataCid: string;

  @ManyToOne(() => Application, application => application.evaluations, {
    onDelete: 'CASCADE',
  })
  application: Application;

  @OneToMany(
    () => EvaluationAnswer,
    evaluationAnswer => evaluationAnswer.evaluation,
    { cascade: true }
  )
  evaluationAnswer: EvaluationAnswer[];

  @Index()
  @Column()
  applicationId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  lastUpdatedAt: Date;
}
