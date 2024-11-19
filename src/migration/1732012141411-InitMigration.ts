import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1732012141411 implements MigrationInterface {
    name = 'InitMigration1732012141411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "evaluation" ("id" SERIAL NOT NULL, "evaluator" character varying(42) NOT NULL, "evaluatorType" "public"."evaluation_evaluatortype_enum" NOT NULL, "summary" character varying NOT NULL, "evaluatorScore" integer NOT NULL, "metadataCid" character varying NOT NULL, "applicationId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_566857ce7db15aa0fb1930b4cdf" UNIQUE ("evaluator", "applicationId"), CONSTRAINT "PK_b72edd439b9db736f55b584fa54" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evaluation_answer" ("id" SERIAL NOT NULL, "answer" "public"."evaluation_answer_answer_enum" NOT NULL, "evaluationId" integer NOT NULL, "evaluationQuestionId" integer NOT NULL, CONSTRAINT "UQ_5d5571491f885c88023b5f56366" UNIQUE ("evaluationId", "evaluationQuestionId"), CONSTRAINT "PK_26adcf2e8e65214d2558b8f6910" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evaluation_question" ("id" SERIAL NOT NULL, "questionIndex" integer NOT NULL, "question" character varying NOT NULL, "poolId" integer NOT NULL, CONSTRAINT "UQ_bd9653bd57844a98c0863a0a5b8" UNIQUE ("poolId", "questionIndex"), CONSTRAINT "PK_6ecc0e6614b9c4bc65c6de2c021" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pool" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloPoolId" character varying NOT NULL, CONSTRAINT "UQ_72fcaa655b2b7348f4feaf25ea3" UNIQUE ("chainId", "alloPoolId"), CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloApplicationId" character varying NOT NULL, "poolId" integer NOT NULL, "profileId" integer, CONSTRAINT "UQ_44dbcb26fba94fd04aaf46392fa" UNIQUE ("alloApplicationId", "poolId", "chainId"), CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profile" ("id" SERIAL NOT NULL, "profileId" character varying NOT NULL, CONSTRAINT "UQ_61a193410d652adedb69f7ad680" UNIQUE ("profileId"), CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "evaluation" ADD CONSTRAINT "FK_f459958482585b957ef22cca734" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" ADD CONSTRAINT "FK_ffe01531544524587279e70fe15" FOREIGN KEY ("evaluationId") REFERENCES "evaluation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" ADD CONSTRAINT "FK_758462d7b628e9d86fe25861566" FOREIGN KEY ("evaluationQuestionId") REFERENCES "evaluation_question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_question" ADD CONSTRAINT "FK_afa6632818bad5e99f65a6261ed" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_2537c29f8628eb085b5478e8b00" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_2537c29f8628eb085b5478e8b00"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`);
        await queryRunner.query(`ALTER TABLE "evaluation_question" DROP CONSTRAINT "FK_afa6632818bad5e99f65a6261ed"`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" DROP CONSTRAINT "FK_758462d7b628e9d86fe25861566"`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" DROP CONSTRAINT "FK_ffe01531544524587279e70fe15"`);
        await queryRunner.query(`ALTER TABLE "evaluation" DROP CONSTRAINT "FK_f459958482585b957ef22cca734"`);
        await queryRunner.query(`DROP TABLE "profile"`);
        await queryRunner.query(`DROP TABLE "application"`);
        await queryRunner.query(`DROP TABLE "pool"`);
        await queryRunner.query(`DROP TABLE "evaluation_question"`);
        await queryRunner.query(`DROP TABLE "evaluation_answer"`);
        await queryRunner.query(`DROP TABLE "evaluation"`);
    }

}
