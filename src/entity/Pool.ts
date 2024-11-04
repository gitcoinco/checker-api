import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: string;

  @Column()
  roundId: string;

  @Column()
  strategy: string;
}
