import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { Profile } from '@/entity/Profile';
import { Pool } from '@/entity/Pool';
import { Evaluation } from '@/entity/Evaluation';

@Entity()
@Index(['poolId', 'chainId'])
@Unique(['alloApplicationId', 'poolId', 'chainId'])
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Index()
  @Column()
  alloApplicationId: string;

  @ManyToOne(() => Pool, pool => pool.applications, {
    onDelete: 'CASCADE',
  })
  pool: Pool;

  @ManyToOne(() => Profile, profile => profile.applications)
  profile: Profile;

  @OneToMany(() => Evaluation, evaluation => evaluation.application)
  evaluations: Evaluation[];

  @Column() // Explicitly define the foreign key column for pool
  poolId: number;
}
