import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from 'typeorm';
import { Application } from './Application';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Application, application => application.profile)
  applications: Application[];

  // profile type : round creator / reviewer / application
}

// Do we need this Entity ? This is useful when we want to group all application of a profile
// Should we store the metadata / fetch from indexer to avoid handling updates
