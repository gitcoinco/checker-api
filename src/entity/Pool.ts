import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  Unique,
} from 'typeorm';
import { EvaluationQuestion } from '@/entity/EvalutionQuestion';
import { Application } from '@/entity/Application';

@Entity()
@Unique(['chainId', 'poolId'])
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  poolId: string;

  @OneToMany(() => EvaluationQuestion, question => question.pool)
  questions: EvaluationQuestion[];

  @OneToMany(() => Application, application => application.pool)
  applications: Application[];
}
