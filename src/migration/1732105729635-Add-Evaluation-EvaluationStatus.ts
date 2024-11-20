import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AddEvaluationEvaluationStatus1732105729635 implements MigrationInterface {
    name = 'AddEvaluationEvaluationStatus1732105729635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evaluation" DROP CONSTRAINT "FK_f459958482585b957ef22cca734"`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" DROP CONSTRAINT "FK_758462d7b628e9d86fe25861566"`);
        await queryRunner.query(`ALTER TABLE "evaluation_question" DROP CONSTRAINT "FK_afa6632818bad5e99f65a6261ed"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`);
        await queryRunner.query(`CREATE TYPE "public"."evaluation_evaluationstatus_enum" AS ENUM('approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "evaluation" ADD "evaluationStatus" "public"."evaluation_evaluationstatus_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "evaluation" ADD CONSTRAINT "FK_f459958482585b957ef22cca734" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" ADD CONSTRAINT "FK_ffe01531544524587279e70fe15" FOREIGN KEY ("evaluationId") REFERENCES "evaluation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" ADD CONSTRAINT "FK_758462d7b628e9d86fe25861566" FOREIGN KEY ("evaluationQuestionId") REFERENCES "evaluation_question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_question" ADD CONSTRAINT "FK_afa6632818bad5e99f65a6261ed" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`);
        await queryRunner.query(`ALTER TABLE "evaluation_question" DROP CONSTRAINT "FK_afa6632818bad5e99f65a6261ed"`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" DROP CONSTRAINT "FK_758462d7b628e9d86fe25861566"`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" DROP CONSTRAINT "FK_ffe01531544524587279e70fe15"`);
        await queryRunner.query(`ALTER TABLE "evaluation" DROP CONSTRAINT "FK_f459958482585b957ef22cca734"`);
        await queryRunner.query(`ALTER TABLE "evaluation" DROP COLUMN "evaluationStatus"`);
        await queryRunner.query(`DROP TYPE "public"."evaluation_evaluationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_question" ADD CONSTRAINT "FK_afa6632818bad5e99f65a6261ed" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation_answer" ADD CONSTRAINT "FK_758462d7b628e9d86fe25861566" FOREIGN KEY ("evaluationQuestionId") REFERENCES "evaluation_question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evaluation" ADD CONSTRAINT "FK_f459958482585b957ef22cca734" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
