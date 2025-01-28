import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  Index,
} from 'typeorm';
import { EvaluationQuestion } from '@/entity/EvaluationQuestion';
import { Application } from '@/entity/Application';

@Entity()
@Index(['chainId', 'alloPoolId'], { unique: true })
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
