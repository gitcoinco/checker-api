import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class InitMigration1731569849269 implements MigrationInterface {
  name = 'InitMigration1731569849269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profile" RENAME COLUMN "name" TO "profileId"`
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "applicationId"`
    );
    await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "metadata"`);
    await queryRunner.query(`ALTER TABLE "pool" DROP COLUMN "poolId"`);
    await queryRunner.query(`ALTER TABLE "pool" DROP COLUMN "strategy"`);
    await queryRunner.query(`ALTER TABLE "pool" DROP COLUMN "isReviewActive"`);
    await queryRunner.query(
      `ALTER TABLE "application" ADD "chainId" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "alloApplicationId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD "evaluatorScore" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD "metadataCid" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_answer" ADD "evaluationId" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_answer" ADD "evaluationQuestionId" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" ADD "questionIndex" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "pool" ADD "alloPoolId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "profile" ADD CONSTRAINT "UQ_61a193410d652adedb69f7ad680" UNIQUE ("profileId")`
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "poolId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" DROP CONSTRAINT "FK_f459958482585b957ef22cca734"`
    );
    await queryRunner.query(`ALTER TABLE "evaluation" DROP COLUMN "evaluator"`);
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD "evaluator" character varying(42) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ALTER COLUMN "applicationId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" DROP CONSTRAINT "FK_afa6632818bad5e99f65a6261ed"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" ALTER COLUMN "poolId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "UQ_44dbcb26fba94fd04aaf46392fa" UNIQUE ("alloApplicationId", "poolId", "chainId")`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD CONSTRAINT "UQ_566857ce7db15aa0fb1930b4cdf" UNIQUE ("evaluator", "applicationId")`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_answer" ADD CONSTRAINT "UQ_5d5571491f885c88023b5f56366" UNIQUE ("evaluationId", "evaluationQuestionId")`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" ADD CONSTRAINT "UQ_bd9653bd57844a98c0863a0a5b8" UNIQUE ("poolId", "questionIndex")`
    );
    await queryRunner.query(
      `ALTER TABLE "pool" ADD CONSTRAINT "UQ_72fcaa655b2b7348f4feaf25ea3" UNIQUE ("chainId", "alloPoolId")`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD CONSTRAINT "FK_f459958482585b957ef22cca734" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_answer" ADD CONSTRAINT "FK_758462d7b628e9d86fe25861566" FOREIGN KEY ("evaluationQuestionId") REFERENCES "evaluation_question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" ADD CONSTRAINT "FK_afa6632818bad5e99f65a6261ed" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" DROP CONSTRAINT "FK_afa6632818bad5e99f65a6261ed"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_answer" DROP CONSTRAINT "FK_758462d7b628e9d86fe25861566"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" DROP CONSTRAINT "FK_f459958482585b957ef22cca734"`
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`
    );
    await queryRunner.query(
      `ALTER TABLE "pool" DROP CONSTRAINT "UQ_72fcaa655b2b7348f4feaf25ea3"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" DROP CONSTRAINT "UQ_bd9653bd57844a98c0863a0a5b8"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_answer" DROP CONSTRAINT "UQ_5d5571491f885c88023b5f56366"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" DROP CONSTRAINT "UQ_566857ce7db15aa0fb1930b4cdf"`
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP CONSTRAINT "UQ_44dbcb26fba94fd04aaf46392fa"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" ALTER COLUMN "poolId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" ADD CONSTRAINT "FK_afa6632818bad5e99f65a6261ed" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ALTER COLUMN "applicationId" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "evaluation" DROP COLUMN "evaluator"`);
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD "evaluator" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" ADD CONSTRAINT "FK_f459958482585b957ef22cca734" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ALTER COLUMN "poolId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "profile" DROP CONSTRAINT "UQ_61a193410d652adedb69f7ad680"`
    );
    await queryRunner.query(`ALTER TABLE "pool" DROP COLUMN "alloPoolId"`);
    await queryRunner.query(
      `ALTER TABLE "evaluation_question" DROP COLUMN "questionIndex"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_answer" DROP COLUMN "evaluationQuestionId"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation_answer" DROP COLUMN "evaluationId"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" DROP COLUMN "lastUpdatedAt"`
    );
    await queryRunner.query(`ALTER TABLE "evaluation" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "evaluation" DROP COLUMN "metadataCid"`
    );
    await queryRunner.query(
      `ALTER TABLE "evaluation" DROP COLUMN "evaluatorScore"`
    );
    await queryRunner.query(
      `ALTER TABLE "application" DROP COLUMN "alloApplicationId"`
    );
    await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "chainId"`);
    await queryRunner.query(
      `ALTER TABLE "pool" ADD "isReviewActive" boolean NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "pool" ADD "strategy" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "pool" ADD "poolId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "metadata" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD "applicationId" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "profile" RENAME COLUMN "profileId" TO "name"`
    );
  }
}
