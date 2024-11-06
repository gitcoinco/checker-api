import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateEntities1730872700779 implements MigrationInterface {
  name = 'CreateEntities1730872700779';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "evaluation_question" ("id" SERIAL NOT NULL, "question" character varying NOT NULL, "poolId" integer, CONSTRAINT "PK_6ecc0e6614b9c4bc65c6de2c021" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "profile" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."evaluation_answer_answer_enum" AS ENUM('yes', 'no', 'uncertain')`
    );
    await queryRunner.query(
      `CREATE TABLE "evaluation_answer" ("id" SERIAL NOT NULL, "answer" "public"."evaluation_answer_answer_enum" NOT NULL, CONSTRAINT "PK_26adcf2e8e65214d2558b8f6910" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."evaluation_evaluatortype_enum" AS ENUM('human', 'llm_gpt3')`
    );
    await queryRunner.query(
      `CREATE TABLE "evaluation" ("id" SERIAL NOT NULL, "evaluator" character varying NOT NULL, "evaluatorType" "public"."evaluation_evaluatortype_enum" NOT NULL, "summary" character varying NOT NULL, "applicationId" integer, CONSTRAINT "PK_b72edd439b9db736f55b584fa54" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "application" ("id" SERIAL NOT NULL, "applicationId" character varying NOT NULL, "metadata" character varying NOT NULL, "poolId" integer, "profileId" integer, CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "pool" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "poolId" character varying NOT NULL, "strategy" character varying NOT NULL, "isReviewActive" boolean NOT NULL, CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" ADD CONSTRAINT "FK_afa6632818bad5e99f65a6261ed" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD CONSTRAINT "FK_f459958482585b957ef22cca734" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_2537c29f8628eb085b5478e8b00" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_2537c29f8628eb085b5478e8b00"`
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" DROP CONSTRAINT "FK_f459958482585b957ef22cca734"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" DROP CONSTRAINT "FK_afa6632818bad5e99f65a6261ed"`
    );
    await queryRunner.query(`DROP TABLE "pool"`);
    await queryRunner.query(`DROP TABLE "application"`);
    await queryRunner.query(`DROP TABLE "evaluation"`);
    await queryRunner.query(
      `DROP TYPE "public"."evaluation_evaluatortype_enum"`
    );
    await queryRunner.query(`DROP TABLE "evaluation_answer"`);
    await queryRunner.query(
      `DROP TYPE "public"."evaluation_answer_answer_enum"`
    );
    await queryRunner.query(`DROP TABLE "profile"`);
    await queryRunner.query(`DROP TABLE "evaluation_question"`);
  }
}
