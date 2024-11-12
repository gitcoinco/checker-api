import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  Unique,
} from 'typeorm';
import { EvaluationQuestion } from '@/entity/EvaluationQuestion';
import { Application } from '@/entity/Application';

@Entity()
@Unique(['chainId', 'alloPoolId'])
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloPoolId: string;

  @OneToMany(() => EvaluationQuestion, question => question.pool)
  questions: EvaluationQuestion[];

  @OneToMany(() => Application, application => application.pool)
  applications: Application[];
}
