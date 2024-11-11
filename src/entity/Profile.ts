import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Application } from '@/entity/Application';

@Entity()
export class Profile {
  @PrimaryColumn({ length: 42 })
  profileId: string;

  @OneToMany(() => Application, application => application.profile)
  applications: Application[];
}
