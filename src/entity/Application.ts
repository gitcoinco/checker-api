import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from './Profile';
import { Pool } from './Pool';
import { Evaluation } from './Evaluation';

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  applicationId: string;

  @Column()
  metadata: string;

  // should we also store poolId ?
  // should we also store profileId ?

  @ManyToOne(() => Pool, pool => pool.applications)
  pool: Pool;

  @ManyToOne(() => Profile, profile => profile.applications)
  profile: Profile;

  @OneToMany(() => Evaluation, evaluation => evaluation.application)
  evaluations: Evaluation[];
}

// should we store on-chain status ?
