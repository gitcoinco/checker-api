import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { EvaluationQuestion } from '@/entity/EvalutionQuestion';
import { Application } from '@/entity/Application';

@Entity()
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  poolId: string;

  @Column()
  strategy: string;

  @Column()
  isReviewActive: boolean;

  @OneToMany(() => EvaluationQuestion, question => question.pool)
  questions: EvaluationQuestion[];

  @OneToMany(() => Application, application => application.pool)
  applications: Application[];

  // Do we need this?
  // @ManyToOne(() =>  Profile, (profile) => profile.id)
  // profile: Profile;
}

// - Fetch metadata from indexer to avoid handling updates ?
// - Should we store
// isReviewActive in the pool entity
// or save start and end time
// or decide on fly which
