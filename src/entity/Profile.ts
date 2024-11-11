import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Application } from '@/entity/Application';

@Entity()
@Unique(['profileId'])
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 42 })
  profileId: string;

  @OneToMany(() => Application, application => application.profile)
  applications: Application[];
}
