import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Profile } from '@/entity/Profile';
import { Pool } from '@/entity/Pool';
import { Evaluation } from '@/entity/Evaluation';

@Entity()
@Unique(['applicationId', 'poolId', 'chainId'])
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  applicationId: string;

  @ManyToOne(() => Pool, pool => pool.applications)
  pool: Pool;

  @ManyToOne(() => Profile, profile => profile.applications)
  profile: Profile;

  @OneToMany(() => Evaluation, evaluation => evaluation.application)
  evaluations: Evaluation[];

  @Column() // Explicitly define the foreign key column for pool
  poolId: number;
}
