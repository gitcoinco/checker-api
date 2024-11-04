import { MigrationInterface, QueryRunner } from "typeorm";

export class PoolMigration1730724453648 implements MigrationInterface {
    name = 'PoolMigration1730724453648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pool" ("id" SERIAL NOT NULL, "chainId" character varying NOT NULL, "roundId" character varying NOT NULL, "strategy" character varying NOT NULL, CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "pool"`);
    }

}
