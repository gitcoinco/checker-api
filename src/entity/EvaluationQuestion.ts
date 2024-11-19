import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  Unique,
  OneToMany,
} from 'typeorm';
import { Pool } from '@/entity/Pool';
import { EvaluationAnswer } from './EvaluationAnswer';

@Entity()
@Unique(['poolId', 'questionIndex'])
export class EvaluationQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  questionIndex: number;

  @Column()
  question: string;

  @OneToMany(() => EvaluationAnswer, answer => answer.evaluationQuestion)
  answers: EvaluationAnswer[];

  @ManyToOne(() => Pool, pool => pool.questions, {
    onDelete: 'CASCADE',
  })
  pool: Pool;

  @Column() // Explicitly define the foreign key column for pool
  poolId: number;
}
