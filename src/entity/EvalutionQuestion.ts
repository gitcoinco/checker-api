import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Pool } from '@/entity/Pool';

@Entity()
export class EvaluationQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @ManyToOne(() => Pool, pool => pool.questions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  pool: Pool;
}
